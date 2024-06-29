import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, UseFilters, Req } from '@nestjs/common';
import { TodoListService } from '../../application/todo-list/todo-list.service';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { UpdateTodoListDto } from './dto/update-todo-list.dto';
import { JwtAuthGuard } from '../../application/authentication/auth.guard';
import { HttpExceptionFilter } from '../../application/filters/http-exception.filter';

@Controller('todolists')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
export class TodoListController {
    constructor(private readonly todoListService: TodoListService) { }

    @Post()
    async create(@Req() req, @Body() createTodoListDto: CreateTodoListDto) {
        const userId = req.user.userId;
        return this.todoListService.createTodoList(userId, createTodoListDto.title);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.todoListService.getTodoListById(id);
    }

    @Get()
    async findAll() {
        return this.todoListService.getAllTodoLists();
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateTodoListDto: UpdateTodoListDto) {
        return this.todoListService.updateTodoList(id, updateTodoListDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const result = await this.todoListService.deleteTodoList(id);
        return result;
    }
}