<script lang="ts">
	import { _ } from "./i18n";
	import { isLoginEnabled } from "./store";
	import { Link } from "svelte-navigator";
	import { loginPath } from "./router";
	import { repoReadmeHeading } from "./platformMeta";
	import I18N from "./components/I18N.svelte";
	import OutLink from "./components/OutLink.svelte";

	const loginRoute = loginPath();
</script>

<main class="content">
	{#if isLoginEnabled}
		<section>
			<h1>{$_("install.service.heading")}</h1>
			<p>
				<I18N keypath="install.service.p1">
					<!-- login -->
					<Link to={loginRoute}>{$_("home.nav.log-in")}</Link>
				</I18N>
			</p>
		</section>
	{/if}

	<section>
		<h1>{$_("install.self.heading")}</h1>
		<p>
			<I18N keypath="install.self.p1">
				<!-- readme -->
				<OutLink to={repoReadmeHeading("setup")}>{$_("install.self.readme")}</OutLink>
			</I18N>
			{#if !isLoginEnabled}&nbsp;{$_("install.self.planning")}{/if}
		</p>
		<p>{$_("install.self.p2")}</p>
	</section>
</main>
