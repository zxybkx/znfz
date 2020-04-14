import store from 'store';
import Cookies from 'js-cookie';
import expirePlugin from 'store/plugins/expire';
store.addPlugin(expirePlugin);

const customStore = {
  add: (key, value , expiration)=> {
    if(expiration){
      store.set(key, value);
    }else{
      store.set(key, value);
    }
  },
  remove: (key)=>{
    store.remove(key);
  },
  get: (key) => {
    return store.get(key);
  },
  getCookie:(key) => {
    const cookies = Cookies.get();
    return cookies[key] || null;
  }
};

export default customStore;
