<script lang="ts">
	import type { CurrentRoute } from "svelte-router-spa/types/components/route";
	import ActionButton from "./buttons/ActionButton.svelte";
	import BootstrapMenu from "./BootstrapMenu.svelte";
	import Lock from "../icons/Lock.svelte";
	import SideMenu from "./SideMenu.svelte";
	import TabBar from "./TabBar.svelte";
	import { APP_ROOTS } from "../router";
	import { pKey, uid } from "../store";

	export let currentRoute: CurrentRoute;

	$: isRoute = APP_ROOTS.includes(currentRoute.path);
	$: isLoggedIn = $uid !== null;
	$: isUnlocked = $pKey !== null;

	function goBack() {
		window.history.back();
	}
</script>

<nav class="navbar">
	{#if isLoggedIn}
		<aside class="leading-actions actions-container">
			{#if !isRoute}
				<ActionButton on:click={goBack}>
					<span>&lt;</span>
				</ActionButton>
			{/if}
			<div id="nav-actions-leading" class="actions-container" />
		</aside>
	{/if}

	{#if isUnlocked}
		<TabBar class="tab-bar" {currentRoute} />
	{:else if !isLoggedIn}
		<BootstrapMenu {currentRoute} />
	{:else}
		<Lock />
	{/if}

	{#if isLoggedIn}
		<aside class="trailing-actions actions-container">
			<div id="nav-actions-trailing" class="actions-container" />
			<SideMenu />
		</aside>
	{/if}
</nav>

<style type="text/scss">
	@use "styles/colors" as *;

	.navbar {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		text-align: center;
		height: 44pt;
		width: 100vw;
		background-color: color($navbar-background);
		color: color($label-dark);

		.actions-container {
			$margin: 0.75em;
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			justify-content: space-evenly;
			height: calc(100% - #{$margin} * 2);
			min-width: 2.8em;
			margin: $margin 1em;
			color: inherit;
		}

		.leading-actions {
			position: absolute;
			top: 0;
			left: 0;
		}

		.trailing-actions {
			position: absolute;
			top: 0;
			right: 0;
		}

		.tab-bar {
			height: 100%;
		}
	}
</style>