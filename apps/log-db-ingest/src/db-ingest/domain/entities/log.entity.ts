import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { LogLevel } from '../enums/log-level.enum';

@Entity({ name: 'logs' })
export class LogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'app_name' })
  appName: string;

  @Column({
    type: 'enum',
    enum: LogLevel,
  })
  level: LogLevel;

  @Column('text')
  message: string;

  @Column({ type: 'timestamp', nullable: true })
  timestamp?: Date;

  @Column({ type: 'jsonb', nullable: true })
  context?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
