import mqtt from "mqtt";

export default class MQTT {
  constructor(options) {
    const { brokerUrl, topics, opt } = options;
    this.brokerUrl = brokerUrl;
    this.topics = topics;
    this.options = opt;
    this.connected = false;
    this.instance = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(this.brokerUrl, {
        clean: true, // 保留会话
        connectTimeout: 4000, // 超时时间
        reconnectPeriod: 1000, // 重连时间间隔
        ...this.options,
      });

      this.client.on("connect", () => {
        console.log("mqtt=====>", "success");
        resolve("Connected to MQTT server");
      });

      this.client.on("error", (error) => {
        console.log("mqtt=====>", "error");
        reject(`MQTT error: ${error}`);
      });
    });
  }

  subscribe(topic, config = {}) {
    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, (err) => {
        if (!err) {
          console.log("mqtt=====>", "Subscribed success");
          resolve(`Subscribed to topic: ${topic}`);
        } else {
          reject(`Error subscribing to topic ${topic}: ${err}`);
        }
      });
    });
  }

  onMessage(callback) {
    this.client.on("message", (topic, message) => {
      console.log("mqtt=====>", "message success");
      callback(topic, message);
    });
  }

  unsubscribe(topic, config = {}) {
    this.client.unsubscribe(topic, config, () => {
      console.log(`取消订阅：${topic}`);
    });
  }

  publish(topic, message) {
    this.client.publish(topic, message);
  }

  disconnect() {
    this.client.end();
  }
}
