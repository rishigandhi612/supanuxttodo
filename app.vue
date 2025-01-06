<template>
  <div>
    <NuxtRouteAnnouncer />
    <h1>TODO App</h1>

    <form @submit.prevent="addTodo">
      <input v-model="newTodo" type="text" placeholder="Enter a new todo" />
      <button type="submit">Add Todo</button>
    </form>

    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <span :class="{ 'completed': todo.completed }">
          {{ todo.text }}
        </span>
        <button @click="toggleComplete(todo)">Toggle Complete</button>
        <button @click="deleteTodo(todo.id)">Delete</button>
      </li>
    </ul>
  </div>
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

  const { data, error } = await $supabase
    .from('todos')
    .insert([{ text: newTodo.value, completed: false }]);

  if (error) {
    console.error('Error adding todo:', error);
    return; // Stop further processing if there's an error
  }

  if (data) {
    todos.value.push(...data); // Push new todo to the list
    newTodo.value = ''; // Clear the input field
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
.completed {
  text-decoration: line-through;
  color: gray;
}
</style>
