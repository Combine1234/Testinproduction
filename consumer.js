const amqp = require("amqplib");
// ไม่ต้องใช้ mysql หรือ connection แล้ว
// const mysql = require("mysql");
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "rootpassword",
//   database: "orders",
// });
// connection.connect(); // ไม่ต้องเชื่อมต่อฐานข้อมูลแล้ว

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function receiveOrders() {
  const conn = await amqp.connect("amqp://mikelopster:password@localhost:5672");
  const channel = await conn.createChannel();

  const queue = "orders-new";
  await channel.assertQueue(queue, { durable: true });

  console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

  channel.prefetch(1);

  channel.consume(queue, async (msg) => {
    try {
      const order = JSON.parse(msg.content.toString());
      console.log(" [x] Received order:", order); // เปลี่ยนข้อความ log ให้ชัดเจนขึ้น

      // ลบส่วนของการบันทึกลง MySQL ออกไป
      // await sleep(10000);
      // const sql = "INSERT INTO orders SET ?";
      // connection.query(sql, order, (error, results) => {
      //   if (error) throw error;
      //   console.log("Order saved to database with id: " + results.insertId);
      // });

      // ถ้าต้องการให้มีการหน่วงเวลาเพื่อจำลองการประมวลผล ก็ยังคง sleep ไว้ได้
      await sleep(1000); // ลดเวลาหน่วงลงเพื่อให้เห็นผลเร็วขึ้น หรือจะลบออกไปเลยก็ได้ถ้าไม่ต้องการ

      // บอกว่าได้ message แล้ว (ยังคงต้องทำเพื่อลบ message ออกจาก queue)
      channel.ack(msg);
      console.log(" [x] Order processed and acknowledged."); // เพิ่ม log เมื่อประมวลผลเสร็จ
    } catch (error) {
      console.log("Error processing message:", error.message); // เปลี่ยนข้อความ log ให้ชัดเจนขึ้น
      // ในกรณีที่มี error ในการ parse JSON หรือประมวลผลอื่นๆ
      // คุณอาจจะต้องพิจารณาว่าจะ requeue ข้อความนี้หรือไม่ (ส่งกลับเข้าคิว)
      // หรือจะทิ้งไปเลย (nack)
      // channel.nack(msg, false, true); // re-queue
      // channel.nack(msg, false, false); // discard
    }
  });
}

receiveOrders();