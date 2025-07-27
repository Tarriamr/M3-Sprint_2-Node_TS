import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Car, User } from './types';

const DB_DIR = join(process.cwd(), 'src', 'db');

type TableName = 'users' | 'cars';

type TableType<Name extends TableName> = Name extends 'users' ? User : Car;

export async function readDatabase<TableNameType extends TableName>(
  tableName: TableNameType,
): Promise<TableType<TableNameType>[]> {
  const filePath = join(DB_DIR, `${tableName}.json`);

  try {
    const fileContent = await readFile(filePath, 'utf-8');
    if (fileContent.trim() === '') {
      return [];
    }
    return JSON.parse(fileContent) as TableType<TableNameType>[];
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return [];
    }
    throw error;
  }
}

export async function writeDatabase<TableNameType extends TableName>(
  tableName: TableNameType,
  data: TableType<TableNameType>[],
): Promise<void> {
  const filePath = join(DB_DIR, `${tableName}.json`);
  const fileContent = JSON.stringify(data, null, 2);
  await writeFile(filePath, fileContent, 'utf-8');
}
