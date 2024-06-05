import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, UseFilters } from '@nestjs/common';
import { TodoItemService } from '../../application/todo-item/todo-item.service';
import { CreateTodoItemDto } from './dto/create-todo-item.dto';
import { UpdateTodoItemDto } from './dto/update-todo-item.dto';
import { HttpExceptionFilter } from '../../application/filters/http-exception.filter';
import { JwtAuthGuard } from '../../application/authentication/auth.guard';

@Controller('todoitems')
@UseFilters(HttpExceptionFilter)
export class TodoItemController {
    constructor(private readonly todoItemService: TodoItemService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() createTodoItemDto: CreateTodoItemDto) {
        return this.todoItemService.createTodoItem(
            createTodoItemDto.todoListId,
            createTodoItemDto.title,
            createTodoItemDto.description,
            createTodoItemDto.priority,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.todoItemService.getTodoItemById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.todoItemService.getAllTodoItems();
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateTodoItemDto: UpdateTodoItemDto) {
        return this.todoItemService.updateTodoItem(id, updateTodoItemDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.todoItemService.deleteTodoItem(id);
    }
}