<script lang="ts">
	import type { Attachment } from "../../model/Attachment";
	import { _, locale } from "../../i18n";
	import { allTransactions, imageDataFromFile } from "../../store";
	import { createEventDispatcher } from "svelte";
	import { toTimestamp } from "../../transformers";
	import ActionButton from "../../components/buttons/ActionButton.svelte";
	import DownloadButton from "../../components/buttons/DownloadButton.svelte";
	import ErrorNotice from "../../components/ErrorNotice.svelte";
	import Form from "../../components/Form.svelte";
	import I18N from "../../components/I18N.svelte";
	import List from "../../components/List.svelte";
	import TransactionListItem from "../transactions/TransactionListItem.svelte";
	import TrashIcon from "../../icons/Trash.svelte";

	export let file: Attachment | null = null;

	const dispatch = createEventDispatcher<{
		delete: Attachment;
		"delete-reference": void;
	}>();

	let imageUrl: string | null = null;
	let imageLoadError: Error | null = null;
	$: linkedTransactions = $allTransactions.filter(
		t => file !== null && t.attachmentIds.includes(file?.id)
	);
	$: transactionCount = linkedTransactions.length;
	$: timestamp = !file
		? $_("date-time.now").toLocaleLowerCase($locale.code)
		: toTimestamp($locale.code, file.createdAt);

	async function loadNewData(file: Attachment) {
		try {
			imageUrl = await imageDataFromFile(file);
		} catch (error) {
			imageLoadError = error as Error;
		}
	}

	$: {
		// Forget old value
		imageUrl = null;
		imageLoadError = null;

		if (file) void loadNewData(file);
	}

	function askToDelete(event: Event) {
		event.preventDefault();
		if (file) {
			dispatch("delete", file); // get rid of the file
		} else {
			dispatch("delete-reference"); // get rid of the file reference
		}
	}
</script>

<Form>
	<main>
		{#if !file}
			<p>{$_("files.does-not-exist")}</p>
		{:else if imageLoadError}
			<ErrorNotice error={imageLoadError} />
		{:else if !imageUrl}
			<p>{$_("common.loading-in-progress")}</p>
		{:else}
			<img src={imageUrl} alt={$_("files.item-alt")} />
		{/if}
	</main>

	<div>
		{#if file}
			<p>
				<I18N keypath="files.meta.name">
					<!-- name -->
					<strong>{file.title}</strong>
				</I18N>
			</p>
			<p>
				<I18N keypath="files.meta.file-type">
					<!-- type -->
					<strong>{file.type}</strong>
				</I18N>
			</p>
			<p>
				<I18N keypath="files.meta.timestamp">
					<!-- timestamp -->
					<strong>{timestamp}</strong>
				</I18N>
			</p>
		{/if}
	</div>

	{#if transactionCount > 0}
		<div class="transaction-count">
			{#if transactionCount === 1}
				<h3>{$_("files.meta.linked-transaction")}</h3>
			{:else}
				<h3>{$_("files.meta.linked-transactions")}</h3>
			{/if}
			<List>
				{#each linkedTransactions as transaction (transaction.id)}
					<li>
						<TransactionListItem {transaction} />
					</li>
				{/each}
			</List>
		</div>
	{/if}

	<h3>{$_("files.meta.actions")}</h3>
	<div class="buttons">
		{#if file}
			<DownloadButton {file} />
		{/if}

		{#if file}
			<ActionButton kind="destructive" on:click={askToDelete}>
				<TrashIcon /> {$_("common.delete-imperative")}</ActionButton
			>
		{:else}
			<ActionButton kind="destructive" on:click={askToDelete}>
				<TrashIcon /> {$_("files.delete.remove-dead-ref")}</ActionButton
			>
		{/if}
	</div>
</Form>

<style lang="scss">
	h3 {
		text-align: left;
	}

	main {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: center;
		margin-bottom: 1em;

		img {
			max-width: 100%;
		}
	}

	.transaction-count {
		:global(ul > li) {
			overflow: hidden;
			border-radius: 4pt;
		}
	}
</style>
