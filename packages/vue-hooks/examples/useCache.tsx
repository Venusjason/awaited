import { defineComponent } from '@vue/composition-api';

import { useRequest } from '@weier/w-vue-hooks';

type Res = { num: string };

const sleep = (delay = 3000) =>
  new Promise((r) => {
    setTimeout(() => {
      r();
    }, delay);
  });

const service = (num): Promise<Res> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        num: (num || Math.ceil(Math.random() * 1000)).toString(),
      });
    }, 300);
  });
};

// 缓存在 5000ms 后失效

const Example = defineComponent({
  setup() {
    return useRequest<Res>(service, {
      cacheKey: Symbol('cache A'),
      cacheTime: 5000,
    });
  },
  render() {
    return (
      <div>
        <el-button type="primary" loading={this.loading} onClick={this.run}>
          按钮
        </el-button>{' '}
        {JSON.stringify(this.data, null, 2)}
      </div>
    );
  },
});

const getUserInfo = async () => {
  await sleep();
  console.log('getUserInfo');
  const t = new Date().getTime();
  const joinTime = '2021-01-01 00:00:00';
  const serviedTime = t - new Date(joinTime).getTime();
  return {
    nick: '客服1号',
    gender: '男',
    joinTime,
    serviedTime,
  };
};

const CACHE_KEY_USER = Symbol('CACHE_KEY_USER');

const CACHE_KEY_USER_OPT = {
  cacheKey: CACHE_KEY_USER,
  cacheTime: 6000,
};

const UserName = defineComponent({
  setup() {
    const { data, loading, run } = useRequest(getUserInfo, CACHE_KEY_USER_OPT);

    return () => (
      <div>
        <span>昵称： {loading.value ? '...' : data.value?.nick}</span>
        <el-button onClick={run}>查询</el-button>
      </div>
    );
  },
});

const UserGender = defineComponent({
  setup() {
    const { data, loading, reset } = useRequest(getUserInfo, CACHE_KEY_USER_OPT);

    return () => (
      <div>
        性别： {loading.value ? '...' : data.value?.gender}
        <el-button onClick={reset}>reset刷新</el-button>
      </div>
    );
  },
});

const UserJoinTime = defineComponent({
  setup() {
    const { data, loading } = useRequest(getUserInfo, CACHE_KEY_USER_OPT);

    return () => (
      <div>
        <div>入职时间： {loading.value ? '...' : data.value?.joinTime}</div>
        <div>已工作： {loading.value ? '...' : data.value?.serviedTime}</div>
      </div>
    );
  },
});

export default defineComponent({
  render() {
    return (
      <div>
        <Example />
        <p>并发模式示例</p>
        <div>
          <UserName />
          <UserGender />
          <UserJoinTime />
        </div>
      </div>
    );
  },
});
