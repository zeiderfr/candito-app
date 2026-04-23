import { onRequestOptions as __api_chat_ts_onRequestOptions } from "/Users/theodiez/Documents/Programme CANDITO/functions/api/chat.ts"
import { onRequestPost as __api_chat_ts_onRequestPost } from "/Users/theodiez/Documents/Programme CANDITO/functions/api/chat.ts"
import { onRequestGet as __api_push_subscribe_ts_onRequestGet } from "/Users/theodiez/Documents/Programme CANDITO/functions/api/push-subscribe.ts"
import { onRequestOptions as __api_push_subscribe_ts_onRequestOptions } from "/Users/theodiez/Documents/Programme CANDITO/functions/api/push-subscribe.ts"
import { onRequestPost as __api_push_subscribe_ts_onRequestPost } from "/Users/theodiez/Documents/Programme CANDITO/functions/api/push-subscribe.ts"

export const routes = [
    {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_chat_ts_onRequestOptions],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_ts_onRequestPost],
    },
  {
      routePath: "/api/push-subscribe",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_push_subscribe_ts_onRequestGet],
    },
  {
      routePath: "/api/push-subscribe",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_push_subscribe_ts_onRequestOptions],
    },
  {
      routePath: "/api/push-subscribe",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_push_subscribe_ts_onRequestPost],
    },
  ]