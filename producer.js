const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");

async function sendOrder(order) {
  const connection = await amqp.connect("amqp://mikelopster:password@localhost:5672");
  const channel = await connection.createChannel();

  const queue = "orders-new";

  // เขียนลง disk เอาไว้ กรณีที่ queue ดับ
  await channel.assertQueue(queue, { durable: true });

  // ใส่ persistent + durable จะได้ข้อมูล queue เดิมออกมาได้
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(order)), { persistent: true });

  console.log(" [x] Sent %s", order);

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
}

const order = {
  orderNumber: uuidv4(),
  product: "apple",
  quantity: 10,
};

sendOrder(order);