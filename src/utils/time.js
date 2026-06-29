import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/zh-cn"; // 如果需要中文显示，请引入相应的 locale

dayjs.extend(utc);
dayjs.extend(duration);

window.day1 = dayjs;

const format = (time, type = "YYYY-MM-DD HH:mm:ss") => {
  return dayjs(time).format(type);
};

const getTime = () => {
  return dayjs().valueOf();
};

export const calculateTimeAgo = (createTime) => {
  const createdTime = dayjs(createTime);
  const durationObject = dayjs.duration(dayjs().diff(createdTime));

  const days = durationObject.days();
  const hours = durationObject.hours();
  const minutes = durationObject.minutes();
  const seconds = durationObject.seconds();

  return `${days}天${hours}小时${minutes}分钟${seconds}秒`;
};

export default {
  format,
  getTime,
  calculateTimeAgo,
};
