import type { NavigationGuard, RouteRecordRaw } from "vue-router";
import Accounts from "../components/accounts/Accounts.vue";
import AccountView from "../components/accounts/AccountView.vue";
import Attachments from "../components/attachments/Attachments.vue";
import EmptyRoute from "../components/EmptyRoute.vue";
import Login from "../components/Login.vue";
import Settings from "../components/Settings.vue";
import Tags from "../components/tags/Tags.vue";
import TransactionView from "../components/transactions/TransactionView.vue";
import { createRouter, createWebHistory } from "vue-router";
import { allTabs } from "../model/ui/tabs";
import { useAuthStore } from "../store/authStore";

// See https://next.router.vuejs.org/guide/advanced/meta.html#typescript about adding types to the `meta` field

type RouteTitleGetter = () => string;
type RouteTitle = string | RouteTitleGetter;

declare module "vue-router" {
	interface RouteMeta {
		title?: RouteTitle;
	}
}

export const APP_ROOTS = allTabs //
	.map(tab => `/${tab}`)
	.concat(["/login"]);

const onlyIfLoggedIn: NavigationGuard = (from, to, next) => {
	const auth = useAuthStore();
	if (auth.uid !== null) {
		next();
	} else {
		next("/login");
	}
};

const accounts: RouteRecordRaw = {
	path: "/accounts",
	beforeEnter: onlyIfLoggedIn,
	component: EmptyRoute,
	children: [
		{
			path: "",
			component: Accounts,
			meta: { title: "Accounts" },
		},
		{
			path: ":accountId",
			component: EmptyRoute,
			children: [
				{
					path: "",
					component: AccountView,
					props: true,
					meta: { title: "Account" },
				},
				{
					path: "transactions/:transactionId",
					component: TransactionView,
					props: true,
					meta: { title: "Transaction" },
				},
			],
		},
	],
};

const attachments: RouteRecordRaw = {
	path: "/attachments",
	beforeEnter: onlyIfLoggedIn,
	component: Attachments,
	meta: { title: "Attachments" },
};

const tags: RouteRecordRaw = {
	path: "/tags",
	beforeEnter: onlyIfLoggedIn,
	component: Tags,
	meta: { title: "Tags" },
};

const settings: RouteRecordRaw = {
	path: "/settings",
	beforeEnter: onlyIfLoggedIn,
	component: Settings,
	meta: { title: "Settings" },
};

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			redirect: "/login",
		},
		{
			path: "/logout",
			component: EmptyRoute,
			async beforeEnter(to, from, next): Promise<void> {
				const auth = useAuthStore();
				await auth.logout();
				next("/login");
			},
		},
		{
			path: "/login",
			component: Login,
			meta: { title: "Login" },
			beforeEnter(from, to, next): void {
				const auth = useAuthStore();
				if (auth.uid !== null) {
					next("/accounts");
				} else {
					next();
				}
			},
		},
		accounts,
		attachments,
		tags,
		settings,
	],
});