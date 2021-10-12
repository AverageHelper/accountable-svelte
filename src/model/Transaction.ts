import type { Identifiable } from "./utility/Identifiable";
import isString from "lodash/isString";
import isBoolean from "lodash/isBoolean";

export type TransactionRecordType = "expense" | "income" | "transaction";

export interface TransactionRecord extends Identifiable<string> {
	amount: number;
	createdAt: Date;
	title: string | null;
	notes: string | null;
	locationId: string | null;
	isReconciled: boolean;
	accountId: string;
}

export type TransactionRecordParams = Omit<TransactionRecord, "id" | "accountId">;

export class Transaction implements TransactionRecord {
	public readonly objectType = "Transaction";
	public readonly id: string;
	public readonly amount: number;
	public readonly createdAt: Date;
	public readonly title: string | null;
	public readonly notes: string | null;
	public readonly locationId: string | null;
	public readonly isReconciled: boolean;
	public readonly accountId: string;

	constructor(accountId: string, id: string, record?: Partial<TransactionRecordParams>) {
		this.id = id;
		this.accountId = accountId;
		const defaultRecord = Transaction.defaultRecord(record);
		this.amount = record?.amount ?? defaultRecord.amount;
		this.createdAt = record?.createdAt ?? defaultRecord.createdAt;
		this.title = (record?.title?.trim() ?? "") || defaultRecord.title;
		this.notes = (record?.notes?.trim() ?? "") || defaultRecord.notes;
		this.locationId = (record?.locationId?.trim() ?? "") || defaultRecord.locationId;
		this.isReconciled = record?.isReconciled ?? defaultRecord.isReconciled;
	}

	get type(): TransactionRecordType {
		if (this.amount > 0) {
			return "income";
		} else if (this.amount < 0) {
			return "expense";
		}
		return "transaction";
	}

	static defaultRecord(record?: Partial<TransactionRecordParams>): TransactionRecordParams {
		return {
			amount: record?.amount ?? 0,
			createdAt: record?.createdAt ?? new Date(),
			title: record?.title ?? null,
			notes: record?.notes ?? null,
			locationId: record?.locationId ?? null,
			isReconciled: record?.isReconciled ?? false,
		};
	}

	static isRecord(toBeDetermined: unknown): toBeDetermined is TransactionRecordParams {
		return (
			(typeof toBeDetermined === "object" &&
				toBeDetermined !== null &&
				toBeDetermined !== undefined &&
				Boolean(toBeDetermined) &&
				!Array.isArray(toBeDetermined) &&
				"amount" in toBeDetermined &&
				"createdAt" in toBeDetermined &&
				"title" in toBeDetermined &&
				"notes" in toBeDetermined &&
				"locationId" in toBeDetermined &&
				"isReconciled" in toBeDetermined &&
				(toBeDetermined as TransactionRecordParams).title === null) ||
			(isString((toBeDetermined as TransactionRecordParams).title) &&
				(toBeDetermined as TransactionRecordParams).notes === null) ||
			(isString((toBeDetermined as TransactionRecordParams).notes) &&
				(toBeDetermined as TransactionRecordParams).locationId === null) ||
			(isString((toBeDetermined as TransactionRecordParams).locationId) &&
				isBoolean((toBeDetermined as TransactionRecordParams).isReconciled))
		);
	}

	toRecord(): TransactionRecord {
		return {
			id: this.id,
			amount: this.amount,
			createdAt: this.createdAt,
			title: this.title,
			notes: this.notes,
			locationId: this.locationId,
			isReconciled: this.isReconciled,
			accountId: this.accountId,
		};
	}
}
