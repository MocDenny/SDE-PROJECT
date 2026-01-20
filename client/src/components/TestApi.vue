<template>
    <div>
        <h1 id="test_msg">{{ message }}</h1>
    </div>
</template>

<script setup>
import axios from 'axios';
// try calling API
const msg = ""
try {
    const response = await axios.get('http://localhost:8080/test');
    console.log(response)
    message = response.data;
} catch (error) {
    console.error('Error fetching message:', error);
}
</script>