import type { AnyDataItem, Identified, IdentifiedDataItem, User } from "./schemas.js";
import type { CollectionReference, DocumentReference } from "./references.js";
import { fileURLToPath } from "url";
import { Low, JSONFile } from "lowdb";
import { unlink, mkdir } from "fs/promises";
import { v4 as uuid } from "uuid";
import path from "path";

async function ensure(path: string): Promise<void> {
	process.stdout.write(`Ensuring directory is available at ${path}...\n`);
	await mkdir(path, { recursive: true });
}

// TODO: Allow specifying a custom db directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.resolve(__dirname, "../../db");

/**
 * Returns a fresh document ID that is virtually guaranteed
 * not to have been used before.
 */
export function newDocumentId(this: void): string {
	return uuid().replace(/-/gu, ""); // remove hyphens
}

type UserIndexDb = Record<string, User>;
type UserDb = Record<string, Record<string, AnyDataItem>>;

async function userIndexDb(): Promise<Low<UserIndexDb>> {
	await ensure(DB_DIR);
	const file = path.join(DB_DIR, "users.json");
	const adapter = new JSONFile<UserIndexDb>(file);
	const db = new Low(adapter);

	await db.read();

	return db;
}

async function dbForUser(uid: string): Promise<Low<UserDb>> {
	if (!uid) throw new TypeError("uid should not be empty");

	const folder = path.join(DB_DIR, "users", uid);
	await ensure(folder);
	const file = path.join(folder, "db.json");
	const adapter = new JSONFile<UserDb>(file);
	const db = new Low(adapter);

	await db.read();

	return db;
}

export async function fetchDbCollection(
	ref: CollectionReference<AnyDataItem>
): Promise<Array<IdentifiedDataItem>> {
	let collection: Record<string, AnyDataItem>;

	if (ref.id === "users") {
		// Special handling, fetch all users
		const db = await userIndexDb();
		if (!db.data) return [];
		collection = db.data;
	} else {
		const db = await dbForUser(ref.uid);
		if (!db.data) return [];
		collection = db.data[ref.id] ?? {};
	}

	const entries = Object.entries(collection);
	return entries.map(([key, value]) => ({ ...value, _id: key }));
}

export async function findUserWithProperties(query: Partial<User>): Promise<User | null> {
	const db = await userIndexDb();
	if (!db.data) return null;

	const collection = db.data;
	const result = Object.values(collection).find<User>((v: User): v is User => {
		// where all properties of `query` match those of `v`
		return Object.keys(query).every(key => {
			return v[key as keyof User] === query[key as keyof User];
		});
	});

	if (!result) return null;
	return { ...result };
}

export async function fetchDbDoc<T extends AnyDataItem>(
	ref: DocumentReference<T>
): Promise<Identified<T> | null> {
	const db = await dbForUser(ref.uid);
	console.debug("fetchDbDoc db has data:", db.data !== null);
	if (!db.data) return null;

	console.debug("fetchDbDoc collection exists:", db.data[ref.parent.id] !== undefined);
	const collection = db.data[ref.parent.id] ?? {};
	const data = collection[ref.id] as T | undefined;
	console.debug("fetchDbDoc data exists:", data !== undefined);
	if (!data) return null;
	return { ...data, _id: ref.id };
}

export async function upsertUser(user: User): Promise<void> {
	const uid = user.uid;
	if (!uid) throw new TypeError("uid property was empty");

	const userIndex = await userIndexDb();
	userIndex.data ??= {};
	userIndex.data[uid] = { ...user };

	const db = await dbForUser(uid);
	if (!db.data) db.data = {};

	db.data["users"] ??= {};
	const collection = db.data["users"];
	collection[uid] = { ...user };

	// commit the databases
	await userIndex.write();
	await db.write();
}

export async function upsertDbDoc<T extends AnyDataItem>(
	ref: DocumentReference<T>,
	data: T
): Promise<void> {
	const db = await dbForUser(ref.uid);
	if (!db.data) db.data = {};

	db.data[ref.parent.id] ??= {}; // upsert an empty object
	const collection = db.data[ref.parent.id] ?? {};
	collection[ref.id] = { ...data };

	await db.write(); // commit the database
}

export async function deleteDbDoc<T extends AnyDataItem>(ref: DocumentReference<T>): Promise<void> {
	const db = await dbForUser(ref.uid);
	if (!db.data) return;

	const collection = db.data[ref.parent.id] ?? {};
	delete collection[ref.id]; // eat the document

	await db.write(); // commit the database
}

export async function deleteDbCollection<T extends AnyDataItem>(
	ref: CollectionReference<T>
): Promise<void> {
	if (ref.id === "users") {
		// Special handling, delete all users, burn everything
		const usersDir = path.join(DB_DIR, "users");
		await unlink(usersDir);

		// Clear the user index
		const db = await dbForUser(ref.uid);
		if (!db.data) return;
		db.data = {};
		await db.write();
		return;
	}

	const db = await dbForUser(ref.uid);
	if (!db.data) return;

	delete db.data[ref.id]; // eat the collection

	await db.write(); // commit the database
}