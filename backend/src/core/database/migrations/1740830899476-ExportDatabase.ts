import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExportDatabase1740830899476 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `passwordResetTokens` RENAME COLUMN `createdAt` TO `created_at`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `passwordResetTokens` RENAME COLUMN `created_at` TO `createdAt`',
    );
  }
}
