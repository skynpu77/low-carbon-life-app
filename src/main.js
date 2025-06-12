import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import api from "./utils/api.js";

export function createApp() {
	const app = createSSRApp(App);
	
	// 将API实例挂载到全局属性
	app.config.globalProperties.$api = api;
	
	return {
		app,
	};
}
