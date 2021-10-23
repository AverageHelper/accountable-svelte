import type { Identifiable } from "./utility/Identifiable";
import isString from "lodash/isString";
import isBoolean from "lodash/isBoolean";

export type TransactionRecordType = "expense" | "income" | "transaction";

export interface TransactionRecordParams {
	amount: number;
	createdAt: Date;
	title: string | null;
	notes: string | null;
	locationId: string | null;
	isReconciled: boolean;
	accountId: string;
	tagIds: Array<string> | null;
}

export class Transaction implements Identifiable<string>, TransactionRecordParams {
	public readonly objectType = "Transaction";
	public readonly id: string;
	public readonly amount: number;
	public readonly createdAt: Date;
	public readonly title: string | null;
	public readonly notes: string | null;
	public readonly locationId: string | null;
	public readonly isReconciled: boolean;
	public readonly accountId: string;
	public readonly tagIds: Array<string> | null;

	constructor(accountId: string, id: string, record?: Partial<TransactionRecordParams>) {
		this.id = id;
		this.accountId = accountId;
		const defaultRecord = Transaction.defaultRecord(record);
		this.amount = record?.amount ?? defaultRecord.amount;
		this.createdAt =
			// handle case where decryption doesn't return a Date object
			(record?.createdAt ? new Date(record.createdAt) : undefined) ?? defaultRecord.createdAt;
		this.title = (record?.title?.trim() ?? "") || defaultRecord.title;
		this.notes = (record?.notes?.trim() ?? "") || defaultRecord.notes;
		this.locationId = (record?.locationId?.trim() ?? "") || defaultRecord.locationId;
		this.isReconciled = record?.isReconciled ?? defaultRecord.isReconciled;
		this.tagIds = record?.tagIds ?? defaultRecord.tagIds;
	}

	get type(): TransactionRecordType {
		if (this.amount > 0) {
			return "income";
		} else if (this.amount < 0) {
			return "expense";
		}
		return "transaction";
	}

	static defaultRecord(
		this: void,
		record?: Partial<TransactionRecordParams>
	): Omit<TransactionRecordParams, "accountId"> {
		return {
			amount: record?.amount ?? 0,
			createdAt: record?.createdAt ?? new Date(),
			title: record?.title ?? null,
			notes: record?.notes ?? null,
			locationId: record?.locationId ?? null,
			isReconciled: record?.isReconciled ?? false,
			tagIds: null,
		};
	}

	static isRecord(this: void, toBeDetermined: unknown): toBeDetermined is TransactionRecordParams {
		return (
			typeof toBeDetermined === "object" &&
			toBeDetermined !== null &&
			toBeDetermined !== undefined &&
			Boolean(toBeDetermined) &&
			!Array.isArray(toBeDetermined) &&
			"amount" in toBeDetermined &&
			"createdAt" in toBeDetermined &&
			"title" in toBeDetermined &&
			((toBeDetermined as TransactionRecordParams).title === null ||
				isString((toBeDetermined as TransactionRecordParams).title)) &&
			"notes" in toBeDetermined &&
			((toBeDetermined as TransactionRecordParams).notes === null ||
				isString((toBeDetermined as TransactionRecordParams).notes)) &&
			"locationId" in toBeDetermined &&
			((toBeDetermined as TransactionRecordParams).locationId === null ||
				isString((toBeDetermined as TransactionRecordParams).locationId)) &&
			"isReconciled" in toBeDetermined &&
			isBoolean((toBeDetermined as TransactionRecordParams).isReconciled)
		);
	}

	toRecord(): TransactionRecordParams & { id: string } {
		return {
			id: this.id,
			amount: this.amount,
			createdAt: this.createdAt,
			title: this.title,
			notes: this.notes,
			locationId: this.locationId,
			isReconciled: this.isReconciled,
			accountId: this.accountId,
			tagIds: this.tagIds,
		};
	}

	updatedWith(params: Partial<TransactionRecordParams>): Transaction {
		const thisRecord = this.toRecord();
		return new Transaction(params.accountId ?? this.accountId, this.id, {
			...thisRecord,
			...params,
		});
	}
}
