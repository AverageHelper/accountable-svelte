<script lang="ts">
	import { _ } from "../i18n";
	import { accountId } from "../store";
	import { createEventDispatcher } from "svelte";
	import ActionButton from "./buttons/ActionButton.svelte";
	import Confirm from "./Confirm.svelte";
	import I18N from "./I18N.svelte";

	const dispatch = createEventDispatcher<{
		yes: void;
		no: void;
	}>();

	export let isOpen: boolean;

	function no() {
		dispatch("no");
	}

	function yes() {
		dispatch("yes");
	}
</script>

<Confirm {isOpen} closeModal={no}>
	<I18N slot="message" keypath="login.new-account.is-account-id-safe">
		<!-- accountId -->
		<code>{$accountId}</code>
	</I18N>

	<ActionButton slot="primary-action" on:click={yes}>{$_("common.yes")}</ActionButton>
	<ActionButton slot="cancel-action" kind="secondary" on:click={no}
		>{$_("common.not-yet")}</ActionButton
	>
</Confirm>
