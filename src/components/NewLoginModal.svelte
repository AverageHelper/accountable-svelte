<script lang="ts">
	import { _ } from "../i18n";
	import { accountId, clearNewLoginStatus, isNewLogin } from "../store";
	import ActionButton from "./buttons/ActionButton.svelte";
	import ConfirmGotNewAccountId from "./ConfirmGotNewAccountId.svelte";
	import I18N from "./I18N.svelte";
	import Modal from "./Modal.svelte";
	import OutLink from "./OutLink.svelte";

	let isConfirmingUserKnowledge = false;

	function askToClearNewLoginStatus(event: Event) {
		event.preventDefault();
		isConfirmingUserKnowledge = true;
	}

	function confirmClearNewLoginStatus() {
		isConfirmingUserKnowledge = false;
		clearNewLoginStatus();
	}

	function cancelClearNewLoginStatus() {
		isConfirmingUserKnowledge = false;
	}
</script>

<Modal open={$isNewLogin}>
	<h1>{$_("login.new-account.heading")}</h1>
	<p>{$_("login.new-account.p1")}</p>
	<p>
		<I18N keypath="login.new-account.remember-this">
			<!-- accountId -->
			<span>
				{#if $isNewLogin}
					<code>{$accountId}</code>
				{/if}
			</span>
		</I18N>
	</p>
	<p>
		<I18N keypath="login.new-account.write-it-down">
			<!-- manager -->
			<OutLink to="https://bitwarden.com">{$_("login.new-account.manager")}</OutLink>
		</I18N>
	</p>
	<p>{$_("login.new-account.no-recovery")}</p>

	<ActionButton on:click={askToClearNewLoginStatus}
		>{$_("login.new-account.acknowledge")}</ActionButton
	>
</Modal>

<ConfirmGotNewAccountId
	isOpen={isConfirmingUserKnowledge}
	on:yes={confirmClearNewLoginStatus}
	on:no={cancelClearNewLoginStatus}
/>
