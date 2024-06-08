import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, UseFilters, Req } from '@nestjs/common';
import { TodoListService } from '../../application/todo-list/todo-list.service';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { UpdateTodoListDto } from './dto/update-todo-list.dto';
import { JwtAuthGuard } from '../../application/authentication/auth.guard';
import { HttpExceptionFilter } from '../../application/filters/http-exception.filter';

@Controller('todolists')
@UseFilters(HttpExceptionFilter)
export class TodoListController {
    constructor(private readonly todoListService: TodoListService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Req() req, @Body() createTodoListDto: CreateTodoListDto) {
        const userId = req.user.userId;
        return this.todoListService.createTodoList(userId, createTodoListDto.title);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.todoListService.getTodoListById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.todoListService.getAllTodoLists();
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateTodoListDto: UpdateTodoListDto) {
        return this.todoListService.updateTodoList(id, updateTodoListDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        const result = await this.todoListService.deleteTodoList(id);
        return result;
    }
}