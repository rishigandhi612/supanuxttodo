<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- Authentication Section -->
        <v-main v-if="!user">
          <h1 class="text-center" style="color: #4caf50">
            Welcome to TODO App
          </h1>
          <v-form @submit.prevent="handleAuth">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="email"
                  label="Email"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="password"
                  label="Password"
                  type="password"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-btn color="success" block type="submit">
                  {{ isSignUp ? "Sign Up" : "Log In" }}
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn text block @click="toggleAuthMode">
                  Switch to {{ isSignUp ? "Log In" : "Sign Up" }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-main>

        <!-- Todo App Section -->
        <v-main v-else>
          <v-row>
            <v-col cols="12" md="10">
              <h1 class="text-center" style="color: #4caf50">
                TODO App
              </h1></v-col
            >
            <v-col cols="12" md="2">
              <v-btn text color="error" class="mb-4" @click="signOut"
                >Log Out</v-btn
              ></v-col
            >
          </v-row>
          <!-- Todo Form -->
          <v-form @submit.prevent="addTodo">
            <v-row>
              <v-col cols="9">
                <v-text-field
                  v-model="newTodo"
                  label="What needs to be done?"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-btn color="success" block type="submit">
                  {{ currentEditIndex !== null ? "Edit Todo" : "Add Todo" }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <!-- Filter Options -->
          <v-btn-toggle v-model="filter" class="my-4" color="success">
            <v-btn value="all">All</v-btn>
            <v-btn value="active">Active</v-btn>
            <v-btn value="completed">Completed</v-btn>
          </v-btn-toggle>

          <!-- Todo List -->
          <v-divider></v-divider>
          <v-list>
            <v-list-item v-if="filteredTodos.length > 0">
              <v-list-item v-for="todo in filteredTodos" :key="todo.id">
                <v-list-item>
                  <v-row>
                    <v-col cols="12" md="9">
                      <v-list-item-title
                        :style="{
                          textDecoration: todo.completed
                            ? 'line-through'
                            : 'none',
                        }"
                      >
                        {{ todo.text }}
                      </v-list-item-title>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-list-item-action>
                        <v-row>
                          <!-- Checkbox -->
                           <v-col>
                            <v-checkbox
                            v-model="todo.completed"
                            @change="toggleComplete(todo)"
                            class="mr-2"
                          ></v-checkbox>
                           </v-col>                         
                        </v-row>
                        <v-row>
                          <!-- Edit and Delete Buttons -->
                           <v-col>
                            <v-btn icon color="blue" @click="editTodo(todo)">
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                           </v-col>
                        <v-col>
                          <v-btn icon color="red" @click="deleteTodo(todo.id)">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </v-col>
                        </v-row>
                        <v-row></v-row>
                      </v-list-item-action>
                    </v-col>
                  </v-row>
                </v-list-item>
              </v-list-item>

              <!-- Footer -->
              <v-divider class="my-4"></v-divider>
              <v-row>
                <v-col cols="12" md="10">
                  <p>Items left: {{ activeTodosCount }}</p>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="12" md="2">
                  <v-btn @click="clearCompleted" text color="grey" outlined>
                    <v-icon>mdi-close</v-icon>
                    Clear Completed
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item>

            <!-- No Todos Fallback -->
            <v-list-item v-else>
              <v-list-item>No todos to display!</v-list-item>
            </v-list-item>
          </v-list>
        </v-main>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
const { $supabase } = useNuxtApp();
import "@mdi/font/css/materialdesignicons.css";

const todos = ref([]);
const newTodo = ref("");
const currentEditIndex = ref(null);
const filter = ref("all");

const email = ref("");
const password = ref("");
const isSignUp = ref(false);
const user = ref(null);

// Auth functions
const handleAuth = async () => {
  let result;
  if (isSignUp.value) {
    result = await $supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });
  } else {
    result = await $supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
  }
  if (result.error) {
    console.error("Auth error:", result.error.message);
  } else {
    user.value = result.data?.user;
    fetchTodos();
  }
};

const signOut = async () => {
  const { error } = await $supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error.message);
  } else {
    user.value = null;
    todos.value = [];
  }
};

const toggleAuthMode = () => {
  isSignUp.value = !isSignUp.value;
};

// Fetch todos
const fetchTodos = async () => {
  if (!user.value) return;
  const { data, error } = await $supabase
    .from("todos")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching todos:", error);
  } else {
    todos.value = data;
  }
};

// Add or update todo
const addTodo = async () => {
  if (newTodo.value.trim() === "") return;

  if (currentEditIndex.value !== null) {
    // Update existing todo
    const todo = todos.value[currentEditIndex.value];
    const { error } = await $supabase
      .from("todos")
      .update({ text: newTodo.value })
      .eq("id", todo.id);

    if (error) {
      console.error("Error updating todo:", error);
    } else {
      todo.text = newTodo.value;
      currentEditIndex.value = null;
    }
  } else {
    // Add new todo
    const { error } = await $supabase
      .from("todos")
      .insert([{ text: newTodo.value, completed: false }]);

    if (error) {
      console.error("Error adding todo:", error);
    } else {
      await fetchTodos();
    }
  }

  newTodo.value = "";
};

// Toggle todo completion
const toggleComplete = async (todo) => {
  const { error } = await $supabase
    .from("todos")
    .update({ completed: todo.completed })
    .eq("id", todo.id);

  if (error) {
    console.error("Error toggling complete:", error);
  }
};

// Edit a todo
const editTodo = (todo) => {
  currentEditIndex.value = todos.value.findIndex((t) => t.id === todo.id);
  newTodo.value = todo.text;
};

// Delete a todo
const deleteTodo = async (id) => {
  const { error } = await $supabase.from("todos").delete().eq("id", id);

  if (error) {
    console.error("Error deleting todo:", error);
  } else {
    todos.value = todos.value.filter((todo) => todo.id !== id);
  }
};

// Clear completed todos
const clearCompleted = async () => {
  const { error } = await $supabase
    .from("todos")
    .delete()
    .eq("completed", true);

  if (error) {
    console.error("Error clearing completed todos:", error);
  } else {
    todos.value = todos.value.filter((todo) => !todo.completed);
  }
};

// Computed properties for filtering and counting todos
const filteredTodos = computed(() => {
  if (filter.value === "all") {
    return todos.value;
  } else if (filter.value === "active") {
    return todos.value.filter((todo) => !todo.completed);
  } else if (filter.value === "completed") {
    return todos.value.filter((todo) => todo.completed);
  }
  return todos.value;
});

const activeTodosCount = computed(() => {
  return todos.value.filter((todo) => !todo.completed).length;
});

// Fetch todos when the component is mounted
onMounted(() => {
  fetchTodos();
});

// Check auth status on mount
onMounted(async () => {
  const {
    data: { user: currentUser },
  } = await $supabase.auth.getUser();
  user.value = currentUser;
  if (user.value) {
    fetchTodos();
  }
});
</script>

<style>
.text-decoration-line-through {
  text-decoration: line-through;
}
</style>
