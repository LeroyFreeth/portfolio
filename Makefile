ESBUILD     = esbuild

# --- Directories ---
SRC_DIR     = src
DRV_DIR     = $(SRC_DIR)/graphic_drivers
PUBLIC_DIR  = public

# --- Common Core Files ---
CORE_SRCS   = $(SRC_DIR)/engine.c

# --- Target Output Names ---
WASM_OUT    = $(PUBLIC_DIR)/logic.wasm
LINUX_OUT   = desktop_app
WIN_OUT     = desktop_app.exe

# ====================================================================
#  1. WEB TARGET (WebGPU / WebAssembly)
# ====================================================================
WASM_CC     = clang
WASM_CFLAGS = --target=wasm32 -O3 -nostdlib -Wall -Wextra
WASM_LDFLAGS= -Wl,--no-entry -Wl,--export-all -Wl,--allow-undefined

web:
	@echo "Compiling Core Logic to WebAssembly..."
	@$(WASM_CC) $(WASM_CFLAGS) $(WASM_LDFLAGS) -o $(WASM_OUT) \
		src/engine.c src/graphic_drivers/wasm_exports.c
	
	@echo "Bundling JavaScript Modules natively via esbuild..."
	@$(ESBUILD) js/main.js --bundle --minify --outfile=$(JS_OUT)
# ====================================================================
#  2. LINUX TARGETS (Fedora 44 / Wayland / Native GCC)
# ====================================================================
LINUX_CC     = gcc
LINUX_CFLAGS = -O2 -Wall -Wextra

linux_gl:
	@echo "Building Native Linux Desktop Target (OpenGL 3.3 Core)..."
	@$(LINUX_CC) $(LINUX_CFLAGS) -o $(LINUX_OUT) \
		$(CORE_SRCS) $(SRC_DIR)/main_desktop.c $(DRV_DIR)/gfx_opengl_desktop.c \
		-lglfw -lGL -lm

linux_gles:
	@echo "Building Native Linux Embedded Target (OpenGL ES 3.0)..."
	@$(LINUX_CC) $(LINUX_CFLAGS) -o $(LINUX_OUT) \
		$(CORE_SRCS) $(SRC_DIR)/main_desktop.c $(DRV_DIR)/gfx_opengl_es.c \
		-lglfw -lGLESv3 -lm

# ====================================================================
#  3. WINDOWS CROSS-COMPILE TARGETS (From Linux via MinGW)
# ====================================================================
# This compiles a native .exe from your Fedora terminal using dnf install mingw64-gcc
WIN_CC     = x86_64-w64-mingw32-gcc
WIN_CFLAGS = -O2 -Wall -Wextra

windows_gl:
	@echo "Building Native Windows Desktop Executable (OpenGL 3.3 Core)..."
	@$(WIN_CC) $(WIN_CFLAGS) -o $(WIN_OUT) \
		$(CORE_SRCS) $(SRC_DIR)/main_desktop.c $(DRV_DIR)/gfx_opengl_desktop.c \
		-lglfw3 -lopengl32 -lgdi32 -luser32 -lkernel32 -lm

# ====================================================================
#  4. UTILITIES
# ====================================================================
serve: web
	@echo "Starting dev server at http://localhost:8080"
	@python3 -m http.server 8080 --directory $(PUBLIC_DIR)

clean:
	@echo "Cleaning compiled application binaries..."
	@rm -f $(WASM_OUT) $(LINUX_OUT) $(WIN_OUT)

.PHONY: web linux_gl linux_gles windows_gl serve clean

