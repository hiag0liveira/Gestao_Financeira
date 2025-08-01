import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
    FIXED_EXPENSE = 'fixed-expense',
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    description: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({
        type: 'enum',
        enum: TransactionType,
    })
    type: TransactionType;

    @Column({ nullable: true })
    recurrenceDay: number;

    @Column({ type: 'date', nullable: true })
    recurrenceEndDate?: Date;


    @ManyToOne(() => User, (user) => user.transactions, { nullable: false })
    user: User;

    @ManyToOne(() => Category, (category) => category.transactions, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    category: Category;
}
