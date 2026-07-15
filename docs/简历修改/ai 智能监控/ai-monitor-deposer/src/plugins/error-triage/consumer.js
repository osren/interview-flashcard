// consumer.js —— Kafka 入口：消费告警消息 → 每条调一次 handleAlarm
//
// 与 server.js 共用 pipeline.js，triage/llm/router 都不变。
// 依赖：kafkajs（npm i kafkajs）。若用公司内部 Kafka 客户端，替换连接部分即可，
// 核心只是「拿到一条 alarm → await handleAlarm(alarm)」。

import { Kafka } from 'kafkajs';
import { handleAlarm } from './pipeline.js';

const kafka = new Kafka({
  clientId: 'error-triage',
  brokers: (process.env.KAFKA_BROKERS || '').split(',').filter(Boolean),
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP || 'error-triage' });

async function start() {
  await consumer.connect();
  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC || 'alerts',
    fromBeginning: false,
  });

  await consumer.run({
    // 跨分区并发度 = LLM 调用的并发旋钮；扛量再靠加分区 + 同 group 多实例水平扩
    partitionsConsumedConcurrently: Number(process.env.KAFKA_CONCURRENCY || 4),
    eachMessage: async ({ message }) => {
      let alarm;
      try {
        alarm = JSON.parse(message.value.toString());
      } catch {
        return; // 脏消息：跳过（视为已消费），不卡队列
      }
      // handleAlarm 内部 triage 全程兜底、永不抛错（出错也保守上报），
      // 所以这里总能正常 resolve → 正常提交位移 → 不会无限重投打爆网关。
      await handleAlarm(alarm);
    },
  });

  console.log('error-triage Kafka consumer running');
}

async function shutdown() {
  try { await consumer.disconnect(); } finally { process.exit(0); }
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  console.error('consumer failed to start:', err);
  process.exit(1);
});
