import config from '../config';

export const INTEGRATE = config.get('/app/integrate');
export const SCALEIMAGE = config.get('/app/scaleImage');
export const CONTEXT = config.get('/app/context');
export const STATIC_CONTEXT = config.get('/app/staticContext');
export const PORTAL = config.get('/app/portal');
export const WOPI_HOST = config.get('/app/wopiHost');
export const WOPI_CONTEXT = config.get('/app/wopiContext');
export const GATEWAY = config.get('/gateway/domain');
export const APP_VERSION = config.get('/app/version');
export const APP_NAME = config.get('/app/config/appName');

export const APP_CODE = config.get('/app/config/appCode');
export const COPYRIGHT = config.get('/app/config/copyright');
export const BACKEND = config.get('/backend/url');
export const TOOLS_LA = config.get("/app/tools/la");
export const TOOLS_LX = config.get("/app/tools/lx");
export const TOOLS_JC = config.get("/app/tools/jc");
export const PROVENCE_NAME = config.get("/app/provence/name");
export const PROVENCE_CODE = config.get("/app/provence/code");
export const PROVENCE_SHORT_CODE = config.get("/app/provence/shortCode");
export const TASK_CONDITION = config.get("/app/task/condition");
export const PROCESS_SIMPLE = config.get("/app/process/simple");
export const PROCESS_MULTIPLE = config.get("/app/process/multiple");
