import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }


    async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password' | 'hashPassword'>> {
        const user = this.usersRepository.create(createUserDto);
        const savedUser = await this.usersRepository.save(user);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, hashPassword, ...result } = savedUser;
        return result;
    }


    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }


    async findOneById(id: number): Promise<Omit<User, 'password' | 'hashPassword'> | null> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (user) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, hashPassword, ...result } = user;
            return result;
        }
        return null;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password' | 'hashPassword'>> {
        const userToUpdate = await this.usersRepository.preload({
            id: id,
            ...updateUserDto,
        });

        if (!userToUpdate) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
        }

        const updatedUser = await this.usersRepository.save(userToUpdate);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, hashPassword, ...result } = updatedUser;
        return result;
    }
}
