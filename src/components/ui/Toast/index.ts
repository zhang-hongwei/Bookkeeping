// 简单的Toast实现，基于browser原生alert
// 生产环境建议使用notistack或react-hot-toast

const Toast = {
  success: (message: string) => {
    console.log('✅ Success:', message);
    alert('✅ ' + message);
  },
  
  error: (message: string) => {
    console.error('❌ Error:', message);
    alert('❌ ' + message);
  },
  
  info: (message: string) => {
    console.log('ℹ️ Info:', message);
    alert('ℹ️ ' + message);
  },
  
  warning: (message: string) => {
    console.warn('⚠️ Warning:', message);
    alert('⚠️ ' + message);
  },
  
  dismiss: (id?: number | string) => {
    console.log('Toast dismissed:', id);
  }
};

export default Toast;