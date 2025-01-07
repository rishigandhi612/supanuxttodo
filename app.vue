<template>
  <v-app>
    <v-main>
      <v-container>
        <h1 class="text-center">TODO App</h1>

        <v-form @submit.prevent="addTodo">
          <v-row>
            <v-col cols="9">
              <v-text-field
                v-model="newTodo"
                label="Enter a new todo"
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-btn color="primary" block type="submit">Add Todo</v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-list>
          <v-list-item
            v-for="todo in todos"
            :key="todo.id"
            :class="{ 'text-decoration-line-through': todo.completed }"
          >
            <v-list-item-content>{{ todo.text }}</v-list-item-content>
            <v-btn icon @click="toggleComplete(todo)">
              <v-icon>{{ todo.completed ? 'mdi-check' : 'mdi-circle-outline' }}</v-icon>
            </v-btn>
            <v-btn icon color="red" @click="deleteTodo(todo.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item>
        </v-list>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const { $supabase } = useNuxtApp();

const todos = ref([]);
const newTodo = ref('');

const fetchTodos = async () => {
  const { data, error } = await $supabase
    .from('todos')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching todos:', error);
  } else {
    todos.value = data;
  }
};

const addTodo = async () => {
  if (newTodo.value.trim() === '') return;

  const { error } = await $supabase
    .from('todos')
    .insert([{ text: newTodo.value, completed: false }]);

  if (error) {
    console.error('Error adding todo:', error);
  } else {
    await fetchTodos();
    newTodo.value = '';
  }
};

const toggleComplete = async (todo) => {
  const { error } = await $supabase
    .from('todos')
    .update({ completed: !todo.completed })
    .eq('id', todo.id);

  if (error) {
    console.error('Error toggling complete:', error);
  } else {
    todo.completed = !todo.completed;
  }
};

const deleteTodo = async (id) => {
  const { error } = await $supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting todo:', error);
  } else {
    todos.value = todos.value.filter((todo) => todo.id !== id);
  }
};

onMounted(() => {
  fetchTodos();
});
</script>

<style>
.text-decoration-line-through {
  text-decoration: line-through;
}
</style>
