#define GL_GLEXT_PROTOTYPES 1
#include <GL/gl.h>
#include <GLFW/glfw3.h>
#include <stdio.h>
#include <stdlib.h>
#include "engine.h"

// Helper function to read shader text files from the disk
char* read_file(const char* filepath) {
    FILE* file = fopen(filepath, "rb");
    if (!file) {
        printf("Failed to open file: %s\n", filepath);
        return NULL;
    }
    fseek(file, 0, SEEK_END);
    long length = ftell(file);
    fseek(file, 0, SEEK_SET);
    char* buffer = malloc(length + 1);
    fread(buffer, 1, length, file);
    buffer[length] = '\0';
    fclose(file);
    return buffer;
}

// Compile and link the vertex and fragment GLSL shaders
GLuint compile_shaders() {
    char* vert_source = read_file("public/shaders/glsl/cube.vert");
    char* frag_source = read_file("public/shaders/glsl/cube.frag");
    if (!vert_source || !frag_source) exit(1);

    GLuint vert_shader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vert_shader, 1, (const char**)&vert_source, NULL);
    glCompileShader(vert_shader);

    GLuint frag_shader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(frag_shader, 1, (const char**)&frag_source, NULL);
    glCompileShader(frag_shader);

    GLuint program = glCreateProgram();
    glAttachShader(program, vert_shader);
    glAttachShader(program, frag_shader);
    glLinkProgram(program);

    free(vert_source);
    free(frag_source);
    glDeleteShader(vert_shader);
    glDeleteShader(frag_shader);

    return program;
}

int main() {
    printf("Starting Native Linux OpenGL Core Backend Engine...\n");

    // 1. Initialize GLFW Context
    if (!glfwInit()) {
        printf("Failed to initialize GLFW\n");
        return -1;
    }

    // Force an explicit OpenGL 3.3 Core profile window frame layout context
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    GLFWwindow* window = glfwCreateWindow(800, 600, "Native C OpenGL Cube Workspace", NULL, NULL);
    if (!window) {
        printf("Failed to generate system UI window footprint.\n");
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);
    glfwSwapInterval(1); // Enable VSync

    // Enable Hardware Z-Depth Testing so back faces wrap behind front faces correctly
    glEnable(GL_DEPTH_TEST);

    // 2. Initialize the Cross-Platform C Engine
    engine_init();

    // 3. Compile local Shaders
    GLuint shader_program = compile_shaders();
    GLint transform_loc = glGetUniformLocation(shader_program, "transform");

    // 4. Setup OpenGL Buffer Management Maps (VAO / VBO)
    GLuint VAO, VBO;
    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);

    glBindVertexArray(VAO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    
    // Bind vertex buffers straight out of our global platform-agnostic engine struct data!
    glBufferData(GL_ARRAY_BUFFER, sizeof(Vertex) * 36, g_engine.vertex_pool, GL_STATIC_DRAW);

    // Attribute Location 0: Positions (X, Y, Z)
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)0);
    glEnableVertexAttribArray(0);

    // Attribute Location 1: UV coordinates (U, V)
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(sizeof(float) * 3));
    glEnableVertexAttribArray(1);

    float last_time = glfwGetTime();

    // 5. The Active Native Simulation Render Loop Execution Tree
    while (!glfwWindowShouldClose(window)) {
        float current_time = glfwGetTime();
        float delta_time = current_time - last_time;
        last_time = current_time;

        // Step A: Calculate rotation math in pure cross-platform C code
        engine_tick(delta_time);

        // Step B: Set up Desktop Display Pipeline state clearing routines
        glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // Step C: Render Core Elements
        glUseProgram(shader_program);
        
        // Pass our C-calculated matrix directly down into the OpenGL pipeline
        glUniformMatrix4fv(transform_loc, 1, GL_FALSE, g_engine.mvp_matrix);

        glBindVertexArray(VAO);
        glDrawArrays(GL_TRIANGLES, 0, g_engine.vertex_count);

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    // Cleanup resources
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);
    glDeleteProgram(shader_program);
    glfwDestroyWindow(window);
    glfwTerminate();

    return 0;
}
