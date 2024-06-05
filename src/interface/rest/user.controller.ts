import { Controller, UseFilters, Post, Body, Get, Param, Delete, UseGuards, UnauthorizedException, Put } from '@nestjs/common';
import { UserService } from '../../application/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../../application/authentication/auth.service';
import { JwtAuthGuard } from '../../application/authentication/auth.guard';
import { HttpExceptionFilter } from '../../application/filters/http-exception.filter';

@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) { }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        const { username, password } = createUserDto;
        const { user, token } = await this.userService.registerUser(username, password);

        return { user, token };
    }

    @Post('login')
    async login(@Body() loginUserDto: { username: string, password: string }) {
        const user = await this.authService.validateUser(loginUserDto.username, loginUserDto.password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.userService.getAllUsers();
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string): Promise<string> {
        const result = await this.userService.deleteUser(id);
        return result;
    }
}