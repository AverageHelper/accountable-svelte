<script lang="ts">
	import { _ } from "../i18n";
	import { repo as repositoryUrl } from "../platformMeta";
	import { loadServerVersion, serverLoadingError, serverVersion } from "../store";
	import { onMount } from "svelte";
	import { version as clientVersion } from "../version";
	import OutLink from "./OutLink.svelte";

	$: isLoading = $serverVersion === "loading" || typeof $serverVersion !== "string";

	onMount(async () => {
		await loadServerVersion();
	});
</script>

<OutLink to={repositoryUrl}
	>{$_("common.platform")}
	{$_("common.application")} v{clientVersion},
	{$_("common.server")}
	{#if isLoading}
		<span title={$serverLoadingError?.message}>vX.X.X</span>
	{:else}
		v{$serverVersion}
	{/if}
</OutLink>
