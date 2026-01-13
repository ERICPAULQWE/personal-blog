# 第1章 数字系统设计与EDA技术

本章概述数字系统、电子设计自动化（EDA）技术的基本概念、发展和设计流程。

## 1.1 数字系统概念

* **数字系统 (Digital System)**：一种处理离散信号的系统。其输入、输出和内部信号都是“数字”的，通常表示为二元值（0 和 1）。
* **对比模拟系统**：模拟系统处理连续变化的信号。
* **核心**：数字系统通过组合逻辑和时序逻辑电路对二进制数据进行存储、处理和传输。
* **示例**：微处理器（CPU）、微控制器（MCU）、数字信号处理器（DSP）、计算机、智能手机等。

## 1.2 电子设计发展历史

电子设计的发展是一个不断提高集成度和自动化水平的过程：
1.  **电子管时代**：手工搭建电路。
2.  **晶体管时代**：分立元件，仍需手工设计和焊接。
3.  **集成电路 (IC)**：
    * **SSI (小规模集成电路)**：几十个晶体管（如基本逻辑门）。
    * **MSI (中规模集成电路)**：几百个晶体管（如译码器、加法器）。
    * **LSI (大规模集成电路)**：成千上万个（如早期的 CPU）。
    * **VLSI (超大规模集成电路)**：几万到几十亿个（如现代 CPU、FPGA）。
4.  **设计方法的演进**：从手工绘制版图，发展到使用计算机辅助设计（CAD），最终演变为高度自动化的 **EDA（电子设计自动化）**。

## 1.3 EDA 技术介绍

* **EDA (Electronic Design Automation)**：指利用计算机软件来完成电子系统（特别是 IC 和 FPGA）的设计、仿真、验证、综合和版图（物理设计）等流程的一系列技术。

### 1.3.1 基本特征

1.  **高抽象层次**：设计师可以使用硬件描述语言（HDL）在较高的抽象级别（如 RTL - 寄存器传输级）描述电路功能，而不用关心底层晶体管。
2.  **自动化**：EDA 工具（如综合器）能自动将 HDL 描述转换为门级电路网表。
3.  **仿真与验证**：能够在设计早期通过仿真发现逻辑错误，大大缩短开发周期。
4.  **设计重用**：IP 核的出现使得复杂的设计可以被复用。

### 1.3.2 主要内容

EDA 技术涵盖了数字设计的整个生命周期：

* **设计输入**：使用 HDL（如 VHDL, Verilog）或原理图输入。
* **仿真 (Simulation)**：验证设计逻辑是否符合预期（功能仿真、时序仿真）。
* **综合 (Synthesis)**：将 HDL 代码“翻译”成由基本逻辑门（与、或、非、触发器等）组成的门级网表。
* **实现 (Implementation)**：
    * **布局 (Place)**：决定芯片上每个逻辑门和宏单元的具体物理位置。
    * **布线 (Route)**：连接这些单元之间的连线。
* **时序分析**：检查电路是否满足时序约束（如时钟频率）。
* **物理验证**：检查版图是否符合制造规则（DRC/LVS）。

### 1.3.3 EDA 设计流程

一个典型的（针对 FPGA/ASIC）EDA 设计流程如下：

1.  **需求分析与规格制定**：明确设计目标和约束。
2.  **设计输入（RTL编码）**：使用 VHDL/Verilog 编写描述电路功能和结构的代码。
3.  **功能仿真（前仿真）**：验证 RTL 代码的逻辑功能是否正确，此时不考虑延迟。
4.  **逻辑综合**：使用综合工具（如 Quartus II, Vivado, Synopsys Design Compiler）将 RTL 代码转换为门级网表，并进行初步优化。
5.  **综合后仿真**：验证综合后的网表功能是否仍正确。
6.  **布局布线（P&R）**：EDA 工具将网表映射到具体的 FPGA 逻辑单元或 ASIC 标准单元，并规划物理连线。
7.  **时序仿真（后仿真）**：使用 P&R 后提取的实际延迟信息进行仿真，验证电路是否满足时序要求（如建立时间/保持时间）。
8.  **（FPGA）比特流生成与下载**：生成配置文件并烧录到 FPGA 芯片中。
9.  **（ASIC）物理验证与流片**：进行DRC/LVS检查后，生成掩模数据送去制造。

## 1.4 IP 核

* **IP (Intellectual Property) 核**：指经过验证、可重用的、具有特定功能的电路设计模块。使用 IP 核可以极大缩短复杂系统（如 SoC）的开发时间。
### 1.4.1 软 IP (Soft IP)
* **形式**：RTL 级的 VHDL/Verilog 代码。
* **特点**：灵活性高，可移植性强（可用于不同工艺），但性能和面积在综合前不确定。
### 1.4.2 固 IP (Firm IP)
* **形式**：已综合的门级网表。
* **特点**：灵活性和性能介于软 IP 和硬 IP 之间。
### 1.4.3 硬 IP (Hard IP)
* **形式**：已完成布局布线的物理版图文件（GDSII）。
* **特点**：针对特定工艺进行了高度优化，性能和面积确定且最优。但缺乏灵活性，不可移植。
* **示例**：ARM CPU 内核、高速收发器（SerDes）、PLL（锁相环）等。

## 1.5 EDA 应用与发展趋势

* **应用**：FPGA 设计、ASIC 设计、SoC（片上系统）设计。
* **趋势**：
    * **更高抽象级**：HLS（高层次综合）允许使用 C/C++ 等语言设计硬件。
    * **AI 驱动**：利用 AI 辅助进行布局布线和时序优化。
    * **云 EDA**：在云平台上进行设计和仿真，应对超大规模设计的算力需求。
    * **Chiplet / 3D-IC**：支持先进封装技术的设计。

---

# 第2章 VHDL 语言基础

本章介绍 VHDL 的基本语法、结构和核心构件。

## 2.1 硬件描述语言的特点

HDL (Hardware Description Language) 与 C/Java 等软件编程语言有本质区别：

1.  **并行性 (Concurrency)**：HDL 的核心特点。它描述的是硬件，硬件中的所有元件（如两个独立的加法器）在现实中是**同时**运行的。VHDL 代码中的大多数语句默认是并行的。
2.  **时序性 (Timing)**：HDL 必须能够描述信号随时间变化的行为，包括时钟、延迟和同步。
3.  **综合性 (Synthesizability)**：HDL 代码不仅要能仿真（描述行为），还要能被综合工具“翻译”成实际的硬件电路（门和触发器）。（注意：并非所有 VHDL 语句都是可综合的，例如 `WAIT FOR 10 ns` 语句在 FPGA 综合中通常无效）。
4.  **结构描述**：HDL 能够描述电路的层次化结构，即如何将小的模块（元件）连接成大的系统。

## 2.2 VHDL 程序基本结构

一个 VHDL 设计文件通常由三个基本部分组成：

1.  **库 (LIBRARY)**：声明需要引用的库。
2.  **实体 (ENTITY)**：定义designs“接口”，即输入和输出端口（像一个黑盒子）。
3.  **结构体 (ARCHITECTURE)**：描述designs“内部实现”，即黑盒子内部的逻辑功能或结构。

**VHDL 代码示例：一个简单的与门**
```VHDL
-- 1. 库声明 (Library Declaration)
-- 引入 IEEE 库，并使用其中的 std_logic_1164 标准逻辑包
LIBRARY ieee;
USE ieee.std_logic_1164.ALL;

-- 2. 实体 (Entity)
-- 定义一个名为 simple_and 的实体
ENTITY simple_and IS
    PORT (
        -- 定义两个输入端口 a_in 和 b_in
        a_in  : IN  STD_LOGIC;
        b_in  : IN  STD_LOGIC;
        -- 定义一个输出端口 c_out
        c_out : OUT STD_LOGIC
    );
END ENTITY simple_and;

-- 3. 结构体 (Architecture)
-- 定义一个名为 dataflow 的结构体，它属于 simple_and 实体
ARCHITECTURE dataflow OF simple_and IS
BEGIN
    -- 这是一个并发语句，描述了数据流
    -- 将 a_in 和 b_in 的逻辑与 (AND) 结果赋给 c_out
    c_out <= a_in AND b_in;

END ARCHITECTURE dataflow;
```
* **注释**：在 VHDL 中，注释以两个短横线 `--` 开始，直到行尾。

## 2.3 VHDL 程序主要构件

### 2.3.1 库 (Library)

* **库 (LIBRARY)**：是VHDL中存储预编译设计单元（如实体、结构体、程序包）的地方。
* **`IEEE` 库**：最重要的标准库。
    * `USE ieee.std_logic_1164.ALL;`：这是几乎所有 VHDL 文件的“标配”。它定义了 `STD_LOGIC` 和 `STD_LOGIC_VECTOR` 类型。`STD_LOGIC` 是一个 9 值逻辑系统（'0', '1', 'Z', 'X', 'U' 等），比简单的 `BIT` 类型（只有 '0', '1'）更适合硬件建模（例如，'Z' 表示高阻态）。
    * `USE ieee.numeric_std.ALL;`：用于进行算术运算（如加减法）。它定义了 `SIGNED`（有符号数）和 `UNSIGNED`（无符号数）类型，以及相关的运算符。
* **`WORK` 库**：这是一个逻辑库名，指向当前正在编译设计的目录。你自己的设计在编译后会默认存放在 `WORK` 库中。

### 2.3.2 实体 (Entity)

* 实体定义了设计的外部视图，是设计与外界交互的接口。
* **`PORT` (端口)**：
    * `IN`：输入。信号只能流入，在实体内部只能读取。
    * `OUT`：输出。信号只能流出，在实体内部不能读取（*这是一个常见陷阱，若需在内部读取输出，应使用 `BUFFER` 或定义一个内部信号*）。
    * `INOUT`：双向。信号可入可出，常用于三态总线。
    * `BUFFER`：缓冲。与 `OUT` 类似，但允许在实体内部读回该端口的值。
* **`GENERIC` (类属)**：
    * `GENERIC` 用于定义实体的参数，使设计更具可配置性。参数在例化时指定，综合时被视为常量。
    * **示例**：定义一个 N 位数据宽度的 D 触发器。
```VHDL
-- 带有 GENERIC 的实体
LIBRARY ieee;
USE ieee.std_logic_1164.ALL;

ENTITY n_bit_dff IS
    GENERIC (
        N : INTEGER := 8  -- 定义一个名为 N 的类属参数，默认为 8
    );
    PORT (
        clk   : IN  STD_LOGIC;
        rst   : IN  STD_LOGIC;
        d_in  : IN  STD_LOGIC_VECTOR(N-1 DOWNTO 0); -- 端口位宽 N-1 到 0
        q_out : OUT STD_LOGIC_VECTOR(N-1 DOWNTO 0)
    );
END ENTITY n_bit_dff;
```
### 2.3.3 结构体 (Architecture)

* 结构体定义了实体的内部实现。一个实体可以有多个结构体（例如，一个用于快速仿真，一个用于最终综合）。
* 结构体内部主要由**并发语句 (Concurrent Statements)** 构成。

* **三种主要的描述风格**：

    1.  **数据流 (Dataflow) 描述**：
        * 使用并发信号赋值语句 (`<=`) 来描述数据在信号之间的流动和转换。
        * `c_out <= a_in AND b_in;` 就是典型的数据流描述。

    2.  **行为 (Behavioral) 描述**：
        * 主要使用 `PROCESS`（进程）语句。
        * `PROCESS` 内部的语句是**顺序执行**的（像传统编程语言）。
        * `PROCESS` 本身在结构体中是**并发执行**的。
        * 常用于描述复杂的时序逻辑（如状态机、带复位的触发器）。
        * **示例**：（D 触发器的行为描述，详细语句在 2.7 节）
	```VHDL
		ARCHITECTURE behavioral OF n_bit_dff IS
		BEGIN
			-- 这是一个进程语句，对 clk 和 rst 敏感
			PROCESS (clk, rst)
			BEGIN
				-- 进程内的语句是顺序执行的
				IF rst = '1' THEN
					q_out <= (OTHERS => '0'); -- 异步复位
				ELSIF rising_edge(clk) THEN
					q_out <= d_in; -- 时钟上升沿采样
				END IF;
			END PROCESS;
		END ARCHITECTURE behavioral;
	```


    3.  **结构 (Structural) 描述**：
        * 通过例化（Instantiation）已有的元件（Component）并将其连接起来，描述电路的层次化结构。
        * **示例**：使用两个半加器（Half-Adder）构建一个全加器（Full-Adder）。
	```VHDL
	ARCHITECTURE structural OF full_adder IS
	        -- 1. 声明需要用到的元件 (半加器)
	        COMPONENT half_adder IS
	            PORT (
	                a, b : IN  STD_LOGIC;
	                sum  : OUT STD_LOGIC;
	                cout : OUT STD_LOGIC
	            );
	        END COMPONENT;
	
	        -- 2. 声明内部连接信号
	        SIGNAL s_ha1, c_ha1, c_ha2 : STD_LOGIC;
	
	    BEGIN
	        -- 3. 例化第一个半加器 (U1)
	        U1 : half_adder
	            PORT MAP (
	                a    => a_in,
	                b    => b_in,
	                sum  => s_ha1,
	                cout => c_ha1
	            );
	
	        -- 4. 例化第二个半加器 (U2)
	        U2 : half_adder
	            PORT MAP (
	                a    => s_ha1,   -- U1 的和作为 U2 的输入
	                b    => c_in,    -- 外部进位作为 U2 的输入
	                sum  => sum_out,
	                cout => c_ha2
	            );
	
	        -- 5. 组合最终的进位输出
	        c_out <= c_ha1 OR c_ha2;
	
	    END ARCHITECTURE structural;
	```

## 2.4 VHDL 的数据对象 (Data Objects)

数据对象用于暂存数据。VHDL 中主要有三类数据对象：

### 2.4.1 信号 (SIGNAL)

* **声明位置**：实体（ENTITY）的端口（PORT）中、结构体（ARCHITECTURE）的声明部分（`IS` 和 `BEGIN` 之间）。
* **赋值符号**：`<=`
* **作用范围**：全局。在整个结构体中都可见。
* **硬件映射**：代表物理的**连线 (Wire)** 或**存储元件 (Register/Flip-Flop)**。
* **特性**：
    * 信号赋值**不是立即发生**的，它是有延迟的（即使是 0 延迟，也只在进程结束后或并发语句执行时更新）。
    * 是 VHDL 中描述硬件并行和时序的核心。
    * 在进程（PROCESS）中为信号赋值，该信号的更新值在**当前进程结束前**是不可见的。
```VHDL
-- 信号声明示例
ARCHITECTURE demo OF some_entity IS
    -- 声明一个内部信号，用于连接
    SIGNAL internal_wire : STD_LOGIC;
BEGIN
    ...
END ARCHITECTURE demo;
```

### 2.4.2 变量 (VARIABLE)

* **声明位置**：**只能**在进程（PROCESS）或子程序（FUNCTION, PROCEDURE）的声明部分（`IS` 和 `BEGIN` 之间）。
* **赋值符号**：`:=`
* **作用范围**：局部。仅在声明它的进程或子程序内部有效。
* **硬件映射**：
    * 在时序逻辑（如时钟进程）中，变量可以被综合为寄存器。
    * 在组合逻辑中，变量通常代表临时的中间结果，帮助简化代码逻辑，**不直接**映射为特定硬件，而是作为计算过程的一部分。
* **特性**：
    * 变量赋值是**立即发生**的（与软件语言相同）。
    * 常用于复杂的算法计算或多步操作中，作为临时存储。
```VHDL
-- 变量声明和使用示例
PROCESS (clk)
    -- 声明一个变量
    VARIABLE temp_calc : INTEGER;
BEGIN
    IF rising_edge(clk) THEN
        -- 变量赋值 (立即发生)
        temp_calc := input_a + input_b;
        
        -- 信号赋值 (进程结束时更新)
        -- 注意：这里使用的是 temp_calc 的最新值
        output_sig <= temp_calc * 2; 
    END IF;
END PROCESS;
```
### 2.4.3 常量 (CONSTANT)

* **声明位置**：程序包（PACKAGE）、实体（ENTITY）、结构体（ARCHITECTURE）、进程（PROCESS）等。
* **赋值符号**：`:=` (仅在声明时赋值)
* **作用范围**：取决于声明位置。
* **硬件映射**：在综合时被视为固定的逻辑值，用于优化电路。
* **特性**：
    * 在设计过程中不能被改变。
    * 用于提高代码的可读性和可维护性（例如，定义总线宽度、状态机编码等）。
```VHDL
-- 常量声明示例
ARCHITECTURE demo OF fsm IS
    -- 定义状态机的状态编码
    CONSTANT IDLE_STATE  : STD_LOGIC_VECTOR(1 DOWNTO 0) := "00";
    CONSTANT RUN_STATE   : STD_LOGIC_VECTOR(1 DOWNTO 0) := "01";
    CONSTANT DONE_STATE  : STD_LOGIC_VECTOR(1 DOWNTO 0) := "10";
BEGIN
    ...
END ARCHITECTURE demo;
```
### 信号 vs 变量 总结

| 特性 | 信号 (SIGNAL) | 变量 (VARIABLE) |
| :--- | :--- | :--- |
| **硬件含义** | 连线 或 寄存器 (记忆元件) | 临时存储 或 寄存器 (取决于上下文) |
| **赋值符号** | `<=` (延迟更新) | `:=` (立即更新) |
| **声明位置** | 结构体、程序包、实体 | 进程、子程序 |
| **作用范围** | 全局 (结构体内) | 局部 (进程内) |

---

## 2.5 VHDL 的数据类型

VHDL 是一种强类型语言，不同类型的数据不能直接混合运算。

### 2.5.1 标准数据类型

这些是 VHDL 语言（`STD` 库）预定义的类型：

* **BIT**：`'0'` 或 `'1'`。
* **BIT_VECTOR**：BIT 类型的数组。 (例如: `"0101"`)
* **BOOLEAN**：`TRUE` 或 `FALSE`。（用于 `IF` 等条件判断，不可综合为 '0'/'1'）
* **INTEGER**：整数。（例如: `1`, `255`, `-10`）。综合器会根据其范围决定所需的位宽。
* **NATURAL**：自然数 (非负整数 `0, 1, 2...`)。
* **POSITIVE**：正整数 (`1, 2, 3...`)。
* **REAL**：浮点数。（例如: `3.14`）。**通常不可综合**，仅用于仿真。
* **TIME**：时间类型。（例如: `10 ns`, `5 us`）。**不可综合**，用于仿真测试平台（Testbench）。

### 2.5.2 IEEE 库数据类型 (最常用)

这些类型定义在 `ieee.std_logic_1164` 和 `ieee.numeric_std` 库中，是实际设计的标准。

* **STD_LOGIC**：
    * 9 值逻辑系统：'U' (未初始化), 'X' (未知), '0', '1', 'Z' (高阻), 'W' (弱未知), 'L' (弱 0), 'H' (弱 1), '-' (忽略)。
    * 在综合中，最有意义的是 '0', '1', 'Z' (用于三态总线) 和 'X' (用于仿真调试)。
* **STD_LOGIC_VECTOR**：
    * `STD_LOGIC` 类型的数组（总线）。
    * `SIGNAL my_bus : STD_LOGIC_VECTOR(7 DOWNTO 0);` -- 声明一个 8 位总线 (索引 7 到 0)
    * `SIGNAL my_bus : STD_LOGIC_VECTOR(0 TO 7);`   -- 声明一个 8 位总线 (索引 0 到 7)

* **UNSIGNED** 和 **SIGNED** (来自 `ieee.numeric_std`)：
    * `UNSIGNED`：表示无符号数。
    * `SIGNED`：表示有符号数（采用二进制补码）。
    * 它们是 `STD_LOGIC_VECTOR` 的“近亲”，但 VHDL 知道它们具有**算术意义**。
    * **关键**：若要进行加减法 (`+`, `-`)，应使用 `UNSIGNED` 或 `SIGNED` 类型，而不是 `STD_LOGIC_VECTOR`。
```VHDL
-- 类型转换示例 (需要 ieee.numeric_std 库)
LIBRARY ieee;
USE ieee.std_logic_1164.ALL;
USE ieee.numeric_std.ALL;

...

SIGNAL slv_vec  : STD_LOGIC_VECTOR(7 DOWNTO 0);
SIGNAL uns_vec  : UNSIGNED(7 DOWNTO 0);
SIGNAL sgn_vec  : SIGNED(7 DOWNTO 0);
SIGNAL int_val  : INTEGER;

...

-- 错误：不同类型不能直接运算
-- uns_vec <= slv_vec + 1; -- 错误!

-- 正确：先进行显式类型转换
uns_vec <= UNSIGNED(slv_vec) + 1; -- 将 SLV 转换为 UNSIGNED
int_val <= TO_INTEGER(uns_vec);    -- 将 UNSIGNED 转换为 INTEGER
slv_vec <= STD_LOGIC_VECTOR(sgn_vec); -- 将 SIGNED 转换为 SLV
```
### 2.5.3 用户自定义类型

1.  **枚举类型 (Enumerated)**：
    * 用于定义一组有名称的常量，最常用于**状态机**。
    * 使代码可读性极高。
	```VHDL
	-- 枚举类型定义状态机
	TYPE T_STATE IS (IDLE, FETCH, DECODE, EXECUTE);
	SIGNAL current_state, next_state : T_STATE;
	
	...
	
	CASE current_state IS
	    WHEN IDLE =>
	        next_state <= FETCH;
	    WHEN FETCH =>
	        ...
	END CASE;
	```
2.  **数组类型 (Array)**：
    * `STD_LOGIC_VECTOR` 本质上就是一种预定义的数组。
    * 可以定义更复杂的数组，如存储器（RAM）。
	```VHDL
	-- 定义一个 8x4 (深度8, 位宽4) 的 RAM
	TYPE T_RAM IS ARRAY (0 TO 7) OF STD_LOGIC_VECTOR(3 DOWNTO 0);
	SIGNAL my_ram : T_RAM;
	
	-- 读写 RAM
	my_ram(address) <= data_in; -- 写入 (需时钟同步)
	data_out <= my_ram(address); -- 读取
	```
3.  **记录类型 (Record)**：
    * 将不同类型的数据对象捆绑在一起，类似 C 语言的结构体 (struct)。

---

## 2.6 VHDL 的运算符

### 2.6.1 逻辑运算符

* `AND`, `OR`, `NAND`, `NOR`, `XOR`, `XNOR`, `NOT`
* 操作数类型：`BIT`, `BOOLEAN`, `STD_LOGIC` 及其向量类型。
* 向量运算：按位进行。
```VHDL
c <= a AND b; -- a, b, c 必须位宽相同
```
### 2.6.2 关系运算符

* `=`, `/=`, `<`, `<=`, `>`, `>=`
* 返回 `BOOLEAN` (TRUE 或 FALSE)。
* 用于 `IF` 和 `WHEN` 语句。
```VHDL
IF (counter = 10) THEN ...
WHEN "01" => ...
```
### 2.6.3 算术运算符

* `+`, `-`, `*`, `/`, `MOD` (取模), `REM` (取余), `**` (乘方)
* **注意**：`+` 和 `-` 运算符在 `ieee.std_logic_1164` 库中**未定义**！
* 必须使用 `ieee.numeric_std` 库，并将操作数设为 `UNSIGNED` 或 `SIGNED` 类型，或者使用 `INTEGER`。
```VHDL
-- 正确的加法 (需要 ieee.numeric_std)
USE ieee.numeric_std.ALL;
...
SIGNAL a, b : IN UNSIGNED(7 DOWNTO 0);
SIGNAL sum  : OUT UNSIGNED(7 DOWNTO 0);
...
sum <= a + b;
```
### 2.6.4 并置运算符 (Concatenation)

* `&`
* 用于将两个或多个向量/位拼接成一个更长的向量。
```VHDL
SIGNAL a : STD_LOGIC_VECTOR(3 DOWNTO 0);
SIGNAL b : STD_LOGIC_VECTOR(3 DOWNTO 0);
SIGNAL c : STD_LOGIC_VECTOR(7 DOWNTO 0);
SIGNAL d : STD_LOGIC;

c <= a & b; -- c(7 downto 4) 得到 a, c(3 downto 0) 得到 b
c <= "0000" & a; -- 扩展位宽
d <= a(3); -- 索引
```
---

## 2.7 VHDL 语句

VHDL 语句分为两类：

1.  **并发语句 (Concurrent Statements)**：
    * 在结构体（ARCHITECTURE）的 `BEGIN` 和 `END` 之间。
    * 所有并发语句都是**并行执行**的，与书写顺序无关。
    * 硬件的自然描述。
2.  **顺序语句 (Sequential Statements)**：
    * **只能**在进程（PROCESS）或子程序（Subprogram）的 `BEGIN` 和 `END` 之间。
    * 语句**按顺序执行**，与软件编程类似。

## 2.8 并发语句

### 2.8.1 进程 (PROCESS) 语句

* `PROCESS` 是 VHDL 中实现**时序逻辑**和复杂**组合逻辑**的核心。
* `PROCESS` 语句本身是一个并发语句（它与其他进程/语句并行执行）。
* 进程内部的语句是顺序执行的。

**敏感列表 (Sensitivity List)**：
* `PROCESS (clk, rst)`：括号内的信号列表。
* **功能**：当敏感列表中的**任何一个**信号发生变化时，进程被激活，从 `BEGIN` 到 `END` 顺序执行一次。
* **综合规则**：
    * **时序逻辑**：通常只包含时钟信号和异步复位/置位信号。
    * **组合逻辑**：必须包含所有在进程中读取的信号（即所有判断条件和赋值语句右侧的信号）。否则会导致综合和仿真不匹配（综合出锁存器 Latch）。
```VHDL
-- 示例 1：D 触发器 (时序逻辑)
PROCESS (clk, rst)
BEGIN
    IF rst = '1' THEN -- 异步复位
        q_out <= '0';
    ELSIF rising_edge(clk) THEN -- 上升沿触发
        q_out <= d_in;
    END IF;
    -- 注意：d_in 不在敏感列表，因为它只在时钟沿被关心
END PROCESS;

-- 示例 2：组合逻辑 (实现 y = (a AND b) OR c)
PROCESS (a, b, c) -- 包含所有输入
BEGIN
    -- 注意：这里使用变量 (:=) 来展示顺序执行
    VARIABLE temp : STD_LOGIC;
    temp := a AND b;
    y_out <= temp OR c; 
END PROCESS;
-- (这个组合逻辑用并发语句 y_out <= (a AND b) OR c; 会更简单)
```

### 2.8.2 并发信号赋值 (Simple Signal Assignment)

* `y_out <= (a AND b) OR c;`
* 最简单的数据流描述。
* 等效于一个**隐含的进程**：
  ```VHDL
      PROCESS (a, b, c) -- 右侧所有信号都在敏感列表
    BEGIN
        y_out <= (a AND b) OR c;
    END PROCESS;
  ```
### 2.8.3 条件信号赋值 (WHEN-ELSE)

* 实现组合逻辑的 `IF-THEN-ELSE` 功能，常用于**多路选择器 (MUX)**。
* 语句是并行的，但赋值有优先级（类似 `IF-ELSIF-ELSE`）。
```VHDL
-- 4 选 1 MUX
y_out <= data_a WHEN sel = "00" ELSE
         data_b WHEN sel = "01" ELSE
         data_c WHEN sel = "10" ELSE
         data_d; -- 对应 sel = "11" 或其他情况 (OTHERS)
```
### 2.8.4 选择信号赋值 (WITH-SELECT-WHEN)

* 实现组合逻辑的 `CASE` 功能，也常用于**多路选择器 (MUX)**。
* 选择是并行的，没有优先级。
```VHDL
-- 4 选 1 MUX
WITH sel SELECT
    y_out <= data_a WHEN "00",
             data_b WHEN "01",
             data_c WHEN "10",
             data_d WHEN OTHERS; -- 必须覆盖所有可能
```
---

## 2.9 顺序语句

这些语句**只能**在 `PROCESS` 或子程序内部使用。

### 2.9.1 变量赋值 (Variable Assignment)

* `variable_name := expression;`
* 立即赋值。

### 2.9.2 信号赋值 (Signal Assignment)

* `signal_name <= expression;`
* 在进程中，赋值在进程执行到 `END PROCESS` 时才更新。
```VHDL
-- 信号和变量在进程中的区别
PROCESS (clk)
    VARIABLE v_temp : INTEGER := 0;
    SIGNAL s_temp : INTEGER := 0;
BEGIN
    IF rising_edge(clk) THEN
        v_temp := v_temp + 1;
        v_temp := v_temp + 1; -- v_temp 立即变为 2
        
        s_temp <= s_temp + 1;
        s_temp <= s_temp + 1; -- s_temp 的“计划更新值”为 1
        
        -- 在这个时钟沿之后
        -- v_temp 的最终值是 2
        -- s_temp 的最终值是 1 (最后一次赋值覆盖了前一次)
        
        var_out <= v_temp; -- 输出 2
        sig_out <= s_temp; -- 输出 1
    END IF;
END PROCESS;
```
### 2.9.3 IF 语句

* `IF condition THEN ... ELSIF condition THEN ... ELSE ... END IF;`
* **综合**：如果 `IF` 语句描述组合逻辑，且没有 `ELSE` 覆盖所有情况，或者反馈回自身，可能会综合成**锁存器 (Latch)**。在同步时序逻辑（时钟进程）中则不会。

### 2.9.4 CASE 语句

* `CASE expression IS ... WHEN "01" => ... WHEN "10" => ... WHEN OTHERS => ... END CASE;`
* **综合**：如果描述组合逻辑，必须使用 `WHEN OTHERS` 覆盖所有可能的情况，否则也会综合成**锁存器 (Latch)**。
* 常用于状态机。
```VHDL
-- 状态机 FSM 示例
PROCESS (clk, rst)
BEGIN
    IF rst = '1' THEN
        current_state <= IDLE;
    ELSIF rising_edge(clk) THEN
        current_state <= next_state; -- 时序逻辑部分
    END IF;
END PROCESS;

-- 组合逻辑部分
PROCESS (current_state, inputs...)
BEGIN
    -- 默认赋值，防止锁存器
    next_state <= current_state; 
    output <= '0';

    CASE current_state IS
        WHEN IDLE =>
            IF input_start = '1' THEN
                next_state <= FETCH;
            END IF;
        WHEN FETCH =>
            next_state <= DECODE;
            output <= '1';
        WHEN OTHERS =>
            next_state <= IDLE;
    END CASE;
END PROCESS;
```
### 2.9.5 循环语句 (LOOP)

1.  **FOR LOOP**：
    * `FOR i IN 0 TO 7 LOOP ... END LOOP;`
    * **可综合**，但循环次数必须是**静态可确定**的。
    * 综合工具会将其“展开”(Unroll) 为并行的硬件电路。
    * 常用于位宽操作，例如逐位异或实现奇偶校验。
	```VHDL
	-- 8 位奇偶校验 (可综合)
	PROCESS (data_in)
	    VARIABLE parity : STD_LOGIC;
	BEGIN
	    parity := '0';
	    FOR i IN 0 TO 7 LOOP
	        parity := parity XOR data_in(i); -- 循环展开
	    END LOOP;
	    parity_out <= parity;
	END PROCESS;
	```
2.  **WHILE LOOP**：
    * `WHILE condition LOOP ... END LOOP;`
    * 循环次数不确定，**通常不可综合**，主要用于仿真。

3.  **LOOP** (无限循环)：
    * `LOOP ... EXIT WHEN condition; ... END LOOP;`
    * **通常不可综合**，主要用于仿真。

---

## 2.10 子程序 (Subprograms)

子程序用于将复杂或重复的代码模块化。它们只能在 `PROCESS` 或其他子程序中被调用。

### 2.10.1 函数 (FUNCTION)

* **目的**：计算并**返回一个值**。
* **特点**：
    * 只有输入参数（默认是 `CONSTANT` 类型）。
    * 不能有 `WAIT` 语句。
    * 不能对信号赋值（除非是 VHDL 2008）。
    * 常用于类型转换或纯组合逻辑计算。
	```VHDL
	-- 函数示例：将 STD_LOGIC_VECTOR 转为 INTEGER
	FUNCTION slv_to_int (slv : STD_LOGIC_VECTOR) RETURN INTEGER IS
	    VARIABLE int_val : INTEGER;
	BEGIN
	    -- (这里用 ieee.numeric_std 更简单, 仅为演示)
	    -- 假设 slv 是 "110" (6)
	    int_val := 0;
	    FOR i IN slv'RANGE LOOP
	        IF slv(i) = '1' THEN
	            int_val := int_val + (2**i);
	        END IF;
	    END LOOP;
	    RETURN int_val;
	END FUNCTION;
	```
### 2.10.2 过程 (PROCEDURE)

* **目的**：执行一系列操作，可以**返回多个值**（通过 `OUT` 或 `INOUT` 参数）。
* **特点**：
    * 可以有 `IN`, `OUT`, `INOUT` 模式的参数（可以是 `SIGNAL` 或 `VARIABLE`）。
    * 可以包含 `WAIT` 语句（如果可综合性允许）。
    * 更像一个“带参数的进程”。
```VHDL
-- 过程示例：执行加法和减法
PROCEDURE calc (
    SIGNAL a, b : IN  INTEGER;
    SIGNAL sum  : OUT INTEGER;
    SIGNAL diff : OUT INTEGER
) IS
BEGIN
    sum  <= a + b;
    diff <= a - b;
END PROCEDURE;
```

---

# 第3章 组合逻辑电路设计

本章重点介绍如何使用 VHDL 描述和设计组合逻辑电路。

## 3.1 组合逻辑电路特点

* **定义**：组合逻辑电路 (Combinational Logic Circuit) 是一种逻辑电路，其任意时刻的**输出仅仅取决于该时刻的输入信号状态**。
* **关键特征**：
    1.  **无记忆性**：电路中不包含任何存储元件（如触发器或锁存器）。
    2.  **无反馈**：信号从输入端流向输出端，通常不包含反馈环路。（*注：异步电路中可能存在反馈，但在同步设计中应避免*）。
* **VHDL 描述**：
    * 使用**并发语句**（如 `WHEN-ELSE`, `WITH-SELECT-WHEN`）。
    * 使用**进程 (PROCESS)** 语句，但**敏感列表必须包含所有**在进程中被读取的信号（即所有判断条件和赋值语句右侧的信号）。如果缺少信号，综合器可能会推断出**锁存器 (Latch)**，这会破坏纯组合逻辑的特性。

## 3.2 基本门电路

VHDL 可以通过简单的逻辑运算符直接描述基本门电路。
```VHDL
-- 库声明 (适用于本章所有示例)
LIBRARY ieee;
USE ieee.std_logic_1164.ALL;

-- 实体 (以与门为例)
ENTITY and_gate IS
    PORT (
        a, b : IN  STD_LOGIC;
        y    : OUT STD_LOGIC
    );
END ENTITY and_gate;

-- 结构体 (数据流描述)
ARCHITECTURE dataflow OF and_gate IS
BEGIN
    -- 3.2.1 与门 (AND)
    y <= a AND b;
END ARCHITECTURE dataflow;

-- 3.2.2 或门 (OR)
-- y <= a OR b;

-- 3.2.3 非门 (NOT)
-- (实体应只有一个输入 a)
-- y <= NOT a;

-- 其他门：
-- 异或 (XOR): y <= a XOR b;
-- 与非 (NAND): y <= a NAND b;
-- 或非 (NOR):  y <= a NOR b;
-- 同或 (XNOR): y <= a XNOR b;
```

## 3.3 编码器 (Encoder)

编码器将多个输入信号（通常是“独热码”，one-hot）转换为较少位数的二进制编码。

### 3.3.1 4-2 编码器

4 个输入 (I0, I1, I2, I3)，2 个输出 (Y0, Y1)。假设任意时刻只有一个输入有效。
```VHDL
-- 实体
ENTITY encoder_4_to_2 IS
    PORT (
        i : IN  STD_LOGIC_VECTOR(3 DOWNTO 0);
        y : OUT STD_LOGIC_VECTOR(1 DOWNTO 0)
    );
END ENTITY encoder_4_to_2;

-- 结构体 (使用 WHEN-ELSE)
ARCHITECTURE behavioral OF encoder_4_to_2 IS
BEGIN
    y <= "00" WHEN i(0) = '1' ELSE
         "01" WHEN i(1) = '1' ELSE
         "10" WHEN i(2) = '1' ELSE
         "11" WHEN i(3) = '1' ELSE
         "XX"; -- "X" 表示无关或未定义
END ARCHITECTURE behavioral;
```
### 3.3.2 优先编码器 (Priority Encoder)

当多个输入同时有效时，只对优先级最高的输入进行编码。通常，索引号越高的输入优先级越高。
```VHDL
-- 示例：4-2 优先编码器 (i(3) 优先级最高)
-- 增加一个 "有效" 输出 (v)，表示至少有一个输入有效
ENTITY priority_encoder_4_to_2 IS
    PORT (
        i : IN  STD_LOGIC_VECTOR(3 DOWNTO 0);
        y : OUT STD_LOGIC_VECTOR(1 DOWNTO 0);
        v : OUT STD_LOGIC -- Valid (有效)
    );
END ENTITY priority_encoder_4_to_2;

-- 结构体 (使用 IF-ELSIF 结构，必须在 PROCESS 中)
ARCHITECTURE behavioral OF priority_encoder_4_to_2 IS
BEGIN
    -- 这是一个组合逻辑进程
    PROCESS (i)
    BEGIN
        -- 默认值
        y <= "00"; -- 默认值 (或 "XX")
        v <= '0';  -- 默认无效

        -- IF-ELSIF 隐含了优先级
        IF i(3) = '1' THEN
            y <= "11";
            v <= '1';
        ELSIF i(2) = '1' THEN
            y <= "10";
            v <= '1';
        ELSIF i(1) = '1' THEN
            y <= "01";
            v <= '1';
        ELSIF i(0) = '1' THEN
            y <= "00";
            v <= '1';
        END IF;
    END PROCESS;
END ARCHITECTURE behavioral;
```

## 3.4 译码器 (Decoder)

译码器是编码器的逆操作，将 N 位二进制码转换为 M (M <= 2^N) 路输出（通常是 one-hot）。

### 3.4.1 3-8 译码器

3 个输入 (a)，8 个输出 (y)。
```VHDL
-- 实体
ENTITY decoder_3_to_8 IS
    PORT (
        a : IN  STD_LOGIC_VECTOR(2 DOWNTO 0);
        y : OUT STD_LOGIC_VECTOR(7 DOWNTO 0)
    );
END ENTITY decoder_3_to_8;

-- 结构体 (使用 WITH-SELECT-WHEN)
ARCHITECTURE behavioral OF decoder_3_to_8 IS
BEGIN
    WITH a SELECT
        y <= "00000001" WHEN "000", -- y(0) = 1
             "00000010" WHEN "001", -- y(1) = 1
             "00000100" WHEN "010", -- y(2) = 1
             "00001000" WHEN "011", -- y(3) = 1
             "00010000" WHEN "100", -- y(4) = 1
             "00100000" WHEN "101", -- y(5) = 1
             "01000000" WHEN "110", -- y(6) = 1
             "10000000" WHEN "111", -- y(7) = 1
             "00000000" WHEN OTHERS; -- 覆盖所有其他可能 (如 'X', 'Z' 等)
END ARCHITECTURE behavioral;
```
### 3.4.2 7 段数码管译码器

将 4 位 BCD 码（0-9）转换为 7 段数码管（a-g）的控制信号。
(假设共阴极数码管：'1' 亮, '0' 灭)
```VHDL
-- 实体
ENTITY bcd_to_7seg IS
    PORT (
        bcd_in  : IN  STD_LOGIC_VECTOR(3 DOWNTO 0);
        seg_out : OUT STD_LOGIC_VECTOR(6 DOWNTO 0) -- (g,f,e,d,c,b,a)
    );
END ENTITY bcd_to_7seg;

-- 结构体 (使用 CASE 语句，必须在 PROCESS 中)
ARCHITECTURE behavioral OF bcd_to_7seg IS
BEGIN
    PROCESS (bcd_in)
    BEGIN
        CASE bcd_in IS
            --        gfedcba
            WHEN "0000" => seg_out <= "0111111"; -- 0
            WHEN "0001" => seg_out <= "0000110"; -- 1
            WHEN "0010" => seg_out <= "1011011"; -- 2
            WHEN "0011" => seg_out <= "1001111"; -- 3
            WHEN "0100" => seg_out <= "1100110"; -- 4
            WHEN "0101" => seg_out <= "1101101"; -- 5
            WHEN "0110" => seg_out <= "1111101"; -- 6
            WHEN "0111" => seg_out <= "0000111"; -- 7
            WHEN "1000" => seg_out <= "1111111"; -- 8
            WHEN "1001" => seg_out <= "1101111"; -- 9
            WHEN OTHERS => seg_out <= "1001001"; -- Error (E)
        END CASE;
    END PROCESS;
END ARCHITECTURE behavioral;
```
## 3.5 多路选择器 (Multiplexer / MUX)

MUX 从多个输入中选择一个作为输出，选择信号 (sel) 决定选择哪一路。
```VHDL
-- 示例：4 选 1 MUX (4 个数据输入, 2 个选择输入)
-- 实体
ENTITY mux_4_to_1 IS
    PORT (
        d0, d1, d2, d3 : IN  STD_LOGIC;
        sel            : IN  STD_LOGIC_VECTOR(1 DOWNTO 0);
        y_out          : OUT STD_LOGIC
    );
END ENTITY mux_4_to_1;

-- 结构体 1: 使用 WHEN-ELSE (条件信号赋值)
ARCHITECTURE dataflow_when OF mux_4_to_1 IS
BEGIN
    y_out <= d0 WHEN sel = "00" ELSE
             d1 WHEN sel = "01" ELSE
             d2 WHEN sel = "10" ELSE
             d3; -- 对应 sel = "11"
END ARCHITECTURE dataflow_when;

-- 结构体 2: 使用 WITH-SELECT-WHEN (选择信号赋值)
ARCHITECTURE dataflow_select OF mux_4_to_1 IS
    -- 我们可以先把4个输入合并成一个向量
    SIGNAL d_vec : STD_LOGIC_VECTOR(3 DOWNTO 0);
BEGIN
    d_vec <= d3 & d2 & d1 & d0;

    WITH sel SELECT
        y_out <= d_vec(0) WHEN "00", -- d0
                 d_vec(1) WHEN "01", -- d1
                 d_vec(2) WHEN "10", -- d2
                 d_vec(3) WHEN OTHERS; -- d3
END ARCHITECTURE dataflow_select;
```

## 3.6 数据比较器 (Data Comparator)

比较两个 N 位数据 A 和 B 的大小。
```VHDL
-- 示例：4 位比较器
-- 实体
ENTITY comparator_4bit IS
    PORT (
        a, b    : IN  STD_LOGIC_VECTOR(3 DOWNTO 0);
        a_gt_b  : OUT STD_LOGIC; -- A > B
        a_eq_b  : OUT STD_LOGIC; -- A = B
        a_lt_b  : OUT STD_LOGIC  -- A < B
    );
END ENTITY comparator_4bit;

-- 结构体 (使用 PROCESS 和 IF)
-- 注意：VHDL 的关系运算符可以直接用于 STD_LOGIC_VECTOR
ARCHITECTURE behavioral OF comparator_4bit IS
BEGIN
    PROCESS (a, b)
    BEGIN
        -- 默认值
        a_gt_b <= '0';
        a_eq_b <= '0';
        a_lt_b <= '0';
        
        IF a > b THEN
            a_gt_b <= '1';
        ELSIF a < b THEN
            a_lt_b <= '1';
        ELSIF a = b THEN
            a_eq_b <= '1';
        END IF;
    END PROCESS;
END ARCHITECTURE behavioral;
```

## 3.7 加法器 (Adder)

加法器是算术逻辑单元 (ALU) 的核心。
```VHDL
-- 示例：4 位全加器 (带进位输入和输出)
-- !! 关键：必须使用 ieee.numeric_std 库
LIBRARY ieee;
USE ieee.std_logic_1164.ALL;
USE ieee.numeric_std.ALL; -- 引入算术库

ENTITY full_adder_4bit IS
    PORT (
        a, b  : IN  STD_LOGIC_VECTOR(3 DOWNTO 0);
        c_in  : IN  STD_LOGIC;
        sum   : OUT STD_LOGIC_VECTOR(3 DOWNTO 0);
        c_out : OUT STD_LOGIC
    );
END ENTITY full_adder_4bit;

ARCHITECTURE behavioral OF full_adder_4bit IS
    -- 算术运算需要使用 UNSIGNED 或 SIGNED 类型
    -- STD_LOGIC_VECTOR (SLV) 默认不能直接做加法

    -- 定义内部信号
    SIGNAL a_uns, b_uns : UNSIGNED(3 DOWNTO 0);
    SIGNAL sum_ext      : UNSIGNED(4 DOWNTO 0); -- 扩展 1 位以容纳进位
    SIGNAL c_in_uns     : UNSIGNED(0 DOWNTO 0); -- 1 位的 UNSIGNED

BEGIN
    -- 1. 类型转换
    a_uns <= UNSIGNED(a);
    b_uns <= UNSIGNED(b);
    c_in_uns(0) <= c_in;

    -- 2. 执行加法
    -- A + B + Cin
    -- 注意：VHDL 2008 允许 STD_LOGIC 和 UNSIGNED/SIGNED 直接相加
    -- VHDL 93 (更安全、更通用的写法):
    sum_ext <= ('0' & a_uns) + ('0' & b_uns) + (sum_ext'RANGE => '0', OTHERS => c_in); -- 复杂的写法
    
    -- VHDL 93 (更简单的写法):
    -- sum_ext <= ('0' & a_uns) + ('0' & b_uns) + c_in; -- 这样写通常不行
    
    -- VHDL 2008 (现代综合器支持):
    -- sum_ext <= ('0' & a_uns) + ('0' & b_uns) + c_in;
    
    -- 最标准、最可靠的 VHDL 93 写法 (使用两次加法):
    -- SIGNAL sum_temp : UNSIGNED(4 DOWNTO 0);
    -- sum_temp <= ('0' & a_uns) + ('0' & b_uns);
    -- sum_ext  <= sum_temp + c_in_uns; -- 需要 c_in 扩位
    
    -- VHDL 93 (最推荐的写法)：
    sum_ext <= UNSIGNED('0' & a) + UNSIGNED('0' & b) + UNSIGNED("0000" & c_in);


    -- 3. 分配输出
    c_out <= sum_ext(4); -- 最高位是进位
    sum   <= STD_LOGIC_VECTOR(sum_ext(3 DOWNTO 0)); -- 低 4 位是和

END ARCHITECTURE behavioral;
```

## 3.8 三态缓冲器 (Tri-state Buffer)

三态门（高电平、低电平、高阻态 'Z'）是实现**双向总线**的基础。
```VHDL
-- 实体
ENTITY tristate_buffer IS
    PORT (
        a_in : IN  STD_LOGIC;
        oe_n : IN  STD_LOGIC; -- 输出使能 (低电平有效)
        y_out: OUT STD_LOGIC
    );
END ENTITY tristate_buffer;

-- 结构体
ARCHITECTURE dataflow OF tristate_buffer IS
BEGIN
    -- 当 oe_n = '0' (使能) 时，输出 a_in
    -- 当 oe_n = '1' (禁止) 时，输出高阻态 'Z'
    y_out <= a_in WHEN oe_n = '0' ELSE 'Z';
END ARCHITECTURE dataflow;

-- 在总线上的应用
-- data_bus <= my_data_out WHEN my_turn_to_write = '1' ELSE (OTHERS => 'Z');
```

## 3.9 组合电路的竞争与冒险

### 3.9.1 竞争-冒险现象

* **竞争 (Race)**：当一个逻辑门的多个输入信号同时发生变化时，由于信号经过不同路径的**传播延迟 (Propagation Delay)** 不同，导致信号到达该门的时间有先有后，这种现象称为竞争。
* **冒险 (Hazard)**：由竞争引起的，在电路输出端产生的非预期的**毛刺 (Glitch)**（短暂的错误脉冲）。
* **分类**：
    1.  **静态冒险 (Static Hazard)**：输入变化时，输出按逻辑本应**保持不变**，但实际上却出现了一个毛刺。
        * `1-0-1` 型（静态 1 冒险）
        * `0-1-0` 型（静态 0 冒险）
    2.  **动态冒险 (Dynamic Hazard)**：输入变化时，输出按逻辑本应**变化一次**，但实际上却变化了多次（如 `1 -> 0 -> 1 -> 0`）。

* **示例 (静态 1 冒险)**：
    * 逻辑函数：`Y = A AND B_NOT`
    * 在 VHDL 中：`Y <= A AND (NOT B);`
    * 如果 A='1', B 从 '1' 变为 '0'。
    * `A` 信号保持 '1'。
    * `NOT B` 信号从 '0' 变为 '1' (经过一个非门，有延迟 T_not)。
    * 逻辑上，Y 应该从 `1 AND 0 = 0` 变为 `1 AND 1 = 1`。
    * (这个例子不好，换一个经典的)
    * * **经典示例**：`Y = A + A_NOT` (即 Y = A OR (NOT A))
    * 逻辑上 Y 恒等于 '1'。
    * 但在物理电路上，A 信号变化时，`A` 和 `A_NOT` (经过非门) 到达 `OR` 门的时间不同。
    * 假设 A 从 '1' 变为 '0'：
        * t=0: A='1', A_NOT='0' => Y = 1 OR 0 = 1
        * t=T_not (非门延迟): A='0', A_NOT 仍为 '0' (A 的变化还未传到) => Y = 0 OR 0 = 0 (产生毛刺!)
        * t>T_not: A='0', A_NOT='1' => Y = 0 OR 1 = 1 (恢复正常)
    * Y 的输出经历了 `1 -> 0 -> 1` 的毛刺。

### 3.9.2 消除竞争-冒险

1.  **逻辑代数法 (卡诺图)**：
    * **增加冗余项 (Consensus Term)**。
    * 对于 `Y = (X1 AND X2) OR (NOT X1 AND X3)`。
    * 当 X2=1, X3=1 时，X1 从 '1' 变为 '0'，Y 应该保持 '1'。
    * 但 Y 会经历 `(1 AND 1) OR (0 AND 1) = 1` 变为 `(0 AND 1) OR (1 AND 1) = 1`。
    * 中间可能出现 `(0 AND 1) OR (0 AND 1) = 0` 的毛刺。
    * **解决方法**：增加冗余项 `(X2 AND X3)`。
    * `Y_new = (X1 AND X2) OR (NOT X1 AND X3) OR (X2 AND X3)`
    * 当 X2=1, X3=1 时，冗余项 `(1 AND 1) = 1`，它“桥接”了变化，使得 Y 始终为 '1'，消除了冒险。

2.  **VHDL/硬件设计中的方法 (最重要)**：
    * **时序化 (Pipelining / Registering Output)**：
    * 组合逻辑的冒险是不可避免的，但在**同步时序电路**中，这些冒险通常**不是问题**。
    * **解决方法**：在组合逻辑的输出端加一个**D 触发器**，用系统时钟对输出结果进行采样。
    * 毛刺通常非常短暂，只要毛刺在时钟的**建立时间 (Setup Time)** 和**保持时间 (Hold Time)** 窗口之外，时钟上升沿就不会采样到这个错误的毛刺值，从而“滤除”了冒险。
	```VHDL
	-- 冒险示例代码 (Y)
	PROCESS (A, B, C)
	BEGIN
	    Y <= (A AND B) OR (NOT A AND C); -- 可能有冒险
	END PROCESS;
	
	-- 消除冒险的代码 (Y_reg)
	PROCESS (CLK)
	BEGIN
	    IF rising_edge(CLK) THEN
	        -- 在时钟边沿采样组合逻辑的 "稳定" 结果
	        Y_reg <= Y; 
	    END IF;
	END PROCESS;
	```

---

# 第4章 时序逻辑电路设计

本章介绍时序逻辑电路，这是数字系统中实现**记忆**功能的核心。与组合逻辑不同，时序逻辑的输出不仅取决于当前输入，还取决于电路**过去的状态**。

## 4.1 时钟与时序逻辑

* **时序逻辑 (Sequential Logic)**：电路中包含存储元件（如触发器），其状态会随时间变化。
* **时钟 (Clock)**：
    * 是时序逻辑电路的“心跳”，一个周期性的方波信号 (0-1-0-1...)。
    * 绝大多数数字系统（尤其是 FPGA 和 ASIC）都是**同步 (Synchronous)** 设计的。
    * **同步设计**：意味着系统中所有的存储元件（触发器）都共享**同一个时钟**信号，并且只在时钟的特定边沿（通常是**上升沿 (Rising Edge)**）进行状态更新（采样输入，改变输出）。
* **为什么使用同步设计**：
    * **时序可控**：设计者可以精确知道数据何时被采样，何时输出发生变化。
    * **消除毛刺**：如第 3 章所述，组合逻辑的输出毛刺在时钟边沿到来之前通常已经稳定，同步采样可以“滤除”这些毛刺。
    * **易于分析**：时序分析工具（STA）可以基于时钟周期来检查电路是否满足速度要求（建立时间和保持时间）。
* **VHDL 中的时钟边沿**：
    * `rising_edge(clk)`：检测 `clk` 信号的上升沿（从 '0' 到 '1'）。
    * `falling_edge(clk)`：检测 `clk` 信号的下降沿（从 '1' 到 '0'）。

## 4.2 触发器 (Flip-Flop)

触发器 (FF) 是最基本的 1 位存储元件。

### 4.2.1 D 触发器 (D Flip-Flop)

D 触发器是最简单、最常用的触发器。

* **功能**：在时钟的有效边沿（例如上升沿），输出端 `Q` 的状态更新为输入端 `D` 的状态。
* **VHDL 描述**：这是 VHDL 中时序逻辑的**最基本模板**。
```VHDL
-- 库声明
LIBRARY ieee;
USE ieee.std_logic_1164.ALL;

-- 实体 1：简单的 D 触发器
ENTITY dff IS
    PORT (
        clk : IN  STD_LOGIC; -- 时钟
        d   : IN  STD_LOGIC; -- 数据输入
        q   : OUT STD_LOGIC  -- 数据输出
    );
END ENTITY dff;

-- 结构体 1
ARCHITECTURE behavioral OF dff IS
BEGIN
    -- 这是一个时序逻辑进程，只对时钟 clk 敏感
    PROCESS (clk)
    BEGIN
        -- 检查是否为时钟上升沿
        IF rising_edge(clk) THEN
            q <= d; -- 在时钟上升沿，将 d 的值赋给 q
        END IF;
    END PROCESS;
END ARCHITECTURE behavioral;


-- 实体 2：带异步复位 (Asynchronous Reset) 的 D 触发器
-- 这是实际设计中最常用的形式 (复位 rst_n 通常低电平有效)
ENTITY dff_async_reset IS
    PORT (
        clk   : IN  STD_LOGIC;
        rst_n : IN  STD_LOGIC; -- 异步复位 (低电平有效)
        d     : IN  STD_LOGIC;
        q     : OUT STD_LOGIC
    );
END ENTITY dff_async_reset;

-- 结构体 2
ARCHITECTURE behavioral OF dff_async_reset IS
BEGIN
    -- 敏感列表必须包含 clk 和 rst_n
    PROCESS (clk, rst_n)
    BEGIN
        -- 首先检查复位 (异步)
        IF rst_n = '0' THEN
            q <= '0';
        -- 如果复位无效，再检查时钟边沿
        ELSIF rising_edge(clk) THEN
            q <= d;
        END IF;
    END PROCESS;
END ARCHITECTURE behavioral;

-- 实体 3：带同步复位 (Synchronous Reset) 的 D 触发器
ENTITY dff_sync_reset IS
    PORT (
        clk   : IN  STD_LOGIC;
        rst_n : IN  STD_LOGIC; -- 同步复位 (低电平有效)
        d     : IN  STD_LOGIC;
        q     : OUT STD_LOGIC
    );
END ENTITY dff_sync_reset;

-- 结构体 3
ARCHITECTURE behavioral OF dff_sync_reset IS
BEGIN
    -- 敏感列表只需要 clk
    PROCESS (clk)
    BEGIN
        IF rising_edge(clk) THEN
            -- 复位检查必须在时钟边沿内部
            IF rst_n = '0' THEN
                q <= '0';
            ELSE
                q <= d;
            END IF;
        END IF;
    END PROCESS;
END ARCHITECTURE behavioral;
```
### 4.2.2 JK 触发器 (JK Flip-Flop)

JK 触发器在 D 触发器出现之前很流行，它具有保持、置位、复位和翻转功能。

* **功能** (在时钟沿)：
    * J=0, K=0: Q 保持不变
    * J=0, K=1: Q 复位 (Q <= '0')
    * J=1, K=0: Q 置位 (Q <= '1')
    * J=1, K=1: Q 翻转 (Q <= NOT Q)
```VHDL
-- 实体
ENTITY jkff IS
    PORT (
        clk : IN  STD_LOGIC;
        j, k : IN  STD_LOGIC;
        q    : OUT STD_LOGIC;
        q_n  : OUT STD_LOGIC -- 反相输出
    );
END ENTITY jkff;

-- 结构体
ARCHITECTURE behavioral OF jkff IS
    -- 需要一个内部信号来读取 Q 的当前状态
    -- 因为 OUT 端口在 VHDL-93 中不能被读回
    SIGNAL q_reg : STD_LOGIC := '0';
BEGIN
    PROCESS (clk)
    BEGIN
        IF rising_edge(clk) THEN
            -- 根据 J 和 K 的值更新 q_reg
            IF j = '0' AND k = '0' THEN
                -- 保持 (什么都不做)
                -- q_reg <= q_reg; (这行是多余的)
            ELSIF j = '0' AND k = '1' THEN
                q_reg <= '0'; -- 复位
            ELSIF j = '1' AND k = '0' THEN
                q_reg <= '1'; -- 置位
            ELSIF j = '1' AND k = '1' THEN
                q_reg <= NOT q_reg; -- 翻转
            END IF;
        END IF;
    END PROCESS;

    -- 将内部寄存器的值赋给输出端口
    q <= q_reg;
    q_n <= NOT q_reg;

END ARCHITECTURE behavioral;
```
### 4.2.3 T 触发器 (T Flip-Flop)

T 触发器是 JK 触发器的简化版 (J=K=T)。

* **功能** (在时钟沿)：
    * T=0: Q 保持不变
    * T=1: Q 翻转 (Q <= NOT Q)
* **应用**：常用于计数器和时钟分频。
```VHDL
-- 实体
ENTITY tff IS
    PORT (
        clk : IN  STD_LOGIC;
        t   : IN  STD_LOGIC; -- 翻转使能
        q   : OUT STD_LOGIC
    );
END ENTITY tff;

-- 结构体
ARCHITECTURE behavioral OF tff IS
    SIGNAL q_reg : STD_LOGIC := '0';
BEGIN
    PROCESS (clk)
    BEGIN
        IF rising_edge(clk) THEN
            IF t = '1' THEN
                q_reg <= NOT q_reg; -- 翻转
            END IF;
            -- T=0 时, 保持不变
        END IF;
    END PROCESS;

    q <= q_reg;
END ARCHITECTURE behavioral;
```

## 4.3 多位寄存器 (Multi-bit Register)

多位寄存器（通常简称寄存器）就是一组并排的 D 触发器，它们共享同一个时钟和复位信号，用于存储一个 N 位的数据（如一个字节）。
```VHDL
-- 实体 (N 位寄存器，N 通过 GENERIC 参数化)
ENTITY n_bit_register IS
    GENERIC (
        N : INTEGER := 8 -- 默认为 8 位
    );
    PORT (
        clk   : IN  STD_LOGIC;
        rst_n : IN  STD_LOGIC; -- 异步复位
        d_in  : IN  STD_LOGIC_VECTOR(N-1 DOWNTO 0);
        q_out : OUT STD_LOGIC_VECTOR(N-1 DOWNTO 0)
    );
END ENTITY n_bit_register;

-- 结构体
ARCHITECTURE behavioral OF n_bit_register IS
BEGIN
    PROCESS (clk, rst_n)
    BEGIN
        IF rst_n = '0' THEN
            -- 复位时，将 N 位向量全部置 0
            q_out <= (OTHERS => '0'); -- (OTHERS => '0') 是 "全 0" 的简写
        ELSIF rising_edge(clk) THEN
            q_out <= d_in; -- N 位数据并行锁存
        END IF;
    END PROCESS;
END ARCHITECTURE behavioral;
```


## 4.4 串进并出型移位寄存器 (SIPO)

移位寄存器是一组级联的 D 触发器，用于数据的串行/并行转换。

* **SIPO (Serial-In, Parallel-Out)**：数据在每个时钟周期串行移入（一次 1 位），但可以并行读出（一次 N 位）。
```VHDL
-- 实体 (4 位 SIPO)
ENTITY sipo_register IS
    PORT (
        clk   : IN  STD_LOGIC;
        rst_n : IN  STD_LOGIC;
        s_in  : IN  STD_LOGIC; -- 串行输入
        p_out : OUT STD_LOGIC_VECTOR(3 DOWNTO 0) -- 并行输出
    );
END ENTITY sipo_register;

-- 结构体
ARCHITECTURE behavioral OF sipo_register IS
    -- 内部寄存器用于存储 4 位数据
    SIGNAL shift_reg : STD_LOGIC_VECTOR(3 DOWNTO 0);
BEGIN
    PROCESS (clk, rst_n)
    BEGIN
        IF rst_n = '0' THEN
            shift_reg <= (OTHERS => '0');
        ELSIF rising_edge(clk) THEN
            -- 移位操作
            -- 使用并置运算符 (&)
            -- 新数据 s_in 进入最高位 (MSB)
            -- 原有数据向低位移动
            -- shift_reg(3) <= s_in;
            -- shift_reg(2) <= shift_reg(3);
            -- shift_reg(1) <= shift_reg(2);
            -- shift_reg(0) <= shift_reg(1);
            
            -- 更简洁的写法 (VHDL):
            shift_reg <= s_in & shift_reg(3 DOWNTO 1);
            
            -- 如果 s_in 要从最低位 (LSB) 移入:
            -- shift_reg <= shift_reg(2 DOWNTO 0) & s_in;
        END IF;
    END PROCESS;

    -- 并行输出
    p_out <= shift_reg;
END ARCHITECTURE behavioral;
```

## 4.5 计数器 (Counter)

计数器是时序逻辑的经典应用，用于对时钟脉冲进行计数。
```VHDL
-- 示例：4 位二进制加法计数器
-- (带同步复位 和 计数使能)
LIBRARY ieee;
USE ieee.std_logic_1164.ALL;
USE ieee.numeric_std.ALL; -- 计数必须使用算术库

ENTITY counter_4bit IS
    PORT (
        clk    : IN  STD_LOGIC;
        rst_n  : IN  STD_LOGIC; -- 同步复位 (低有效)
        en     : IN  STD_LOGIC; -- 计数使能 (高有效)
        count  : OUT STD_LOGIC_VECTOR(3 DOWNTO 0)
    );
END ENTITY counter_4bit;

ARCHITECTURE behavioral OF counter_4bit IS
    -- 内部寄存器用于存储计数值
    -- 必须使用 UNSIGNED 类型才能进行 +1 操作
    SIGNAL count_reg : UNSIGNED(3 DOWNTO 0);
BEGIN
    PROCESS (clk)
    BEGIN
        IF rising_edge(clk) THEN
            -- 1. 检查同步复位
            IF rst_n = '0' THEN
                count_reg <= (OTHERS => '0'); -- 复位为 0
            -- 2. 检查使能
            ELSIF en = '1' THEN
                count_reg <= count_reg + 1; -- 计数加 1
            END IF;
            -- 3. 如果 rst_n='1' 且 en='0', 寄存器保持不变
        END IF;
    END PROCESS;

    -- 将内部的 UNSIGNED 类型转换为 STD_LOGIC_VECTOR 输出
    count <= STD_LOGIC_VECTOR(count_reg);
END ARCHITECTURE behavioral;
```

## 4.6 无符号数乘法器

乘法器是复杂的电路。它可以是纯组合逻辑（如 `a * b`），但这种实现方式在位宽 N 很大时，会消耗大量逻辑资源且延迟很高。

在时序电路设计中，乘法器通常使用**时序逻辑（多周期）** 来实现，例如“移位相加”法，以节省资源。
```VHDL
-- 示例：4x4 位无符号乘法器 (移位相加法)
-- 这需要一个控制器 (状态机) 和一个数据通路
-- 这是一个相对复杂的设计，这里展示其基本思想

LIBRARY ieee;
USE ieee.std_logic_1164.ALL;
USE ieee.numeric_std.ALL;

ENTITY multiplier_4x4_seq IS
    PORT (
        clk     : IN  STD_LOGIC;
        rst_n   : IN  STD_LOGIC;
        start   : IN  STD_LOGIC; -- 开始计算
        a_in    : IN  STD_LOGIC_VECTOR(3 DOWNTO 0); -- 乘数
        b_in    : IN  STD_LOGIC_VECTOR(3 DOWNTO 0); -- 被乘数
        p_out   : OUT STD_LOGIC_VECTOR(7 DOWNTO 0); -- 乘积 (N+N=8位)
        done    : OUT STD_LOGIC -- 计算完成
    );
END ENTITY multiplier_4x4_seq;

ARCHITECTURE fsm OF multiplier_4x4_seq IS
    -- 1. 定义状态
    TYPE T_STATE IS (IDLE, CALC, FINISH);
    SIGNAL state : T_STATE;

    -- 2. 数据通路寄存器
    SIGNAL a_reg : UNSIGNED(3 DOWNTO 0); -- 乘数
    SIGNAL b_reg : UNSIGNED(3 DOWNTO 0); -- 被乘数 (将用于移位)
    SIGNAL p_reg : UNSIGNED(7 DOWNTO 0); -- 部分积 (8位)
    SIGNAL cnt_reg : INTEGER RANGE 0 TO 4; -- 计数器 (控制 4 轮)

BEGIN
    -- 3. 控制器 (状态机 FSM)
    PROCESS (clk, rst_n)
    BEGIN
        IF rst_n = '0' THEN
            state   <= IDLE;
            cnt_reg <= 0;
            done    <= '0';
        ELSIF rising_edge(clk) THEN
            done <= '0'; -- 默认为 0
            CASE state IS
                WHEN IDLE =>
                    IF start = '1' THEN
                        -- 锁存输入, 准备计算
                        a_reg   <= UNSIGNED(a_in);
                        b_reg   <= UNSIGNED(b_in);
                        p_reg   <= (OTHERS => '0'); -- 部分积清零
                        cnt_reg <= 0;
                        state   <= CALC;
                    END IF;
                
                WHEN CALC =>
                    -- 执行 4 轮移位相加
                    IF cnt_reg < 4 THEN
                        -- 移位相加逻辑在下面数据通路中
                        state   <= CALC;
                        cnt_reg <= cnt_reg + 1;
                    ELSE
                        -- 4 轮结束
                        state   <= FINISH;
                    END IF;

                WHEN FINISH =>
                    done  <= '1'; -- 告知外部已完成
                    state <= IDLE;
            END CASE;
        END IF;
    END PROCESS;

    -- 4. 数据通路 (Datapath)
    -- 这是真正执行计算的进程
    PROCESS (clk)
    BEGIN
        IF rising_edge(clk) THEN
            IF state = IDLE AND start = '1' THEN
                -- 在 IDLE -> CALC 时锁存 b_in
                b_reg <= UNSIGNED(b_in);
                p_reg <= (OTHERS => '0');
            ELSIF state = CALC THEN
                -- "移位相加" 核心逻辑
                -- 检查 b_reg 的最低位
                IF b_reg(0) = '1' THEN
                    -- 最低位为 1, 则 部分积 + 乘数
                    -- 注意 P 的高 4 位 + A
                    p_reg(7 DOWNTO 4) <= p_reg(7 DOWNTO 4) + a_reg;
                END IF;
                
                -- 将部分积 P 右移 1 位 (逻辑右移)
                -- 将被乘数 B 右移 1 位
                p_reg <= '0' & p_reg(7 DOWNTO 1);
                b_reg <= '0' & b_reg(3 DOWNTO 1);
            END IF;
        END IF;
    END PROCESS;

    -- 5. 输出
    p_out <= STD_LOGIC_VECTOR(p_reg);
    
END ARCHITECTURE fsm;
```

---

# 第5章 同步时序电路设计

本章深入探讨同步时序电路的设计，其核心是**有限状态机 (Finite State Machine, FSM)**。

## 5.1 时序电路的特点与组成

同步时序电路由两部分组成：
1.  **存储元件 (Memory Elements)**：通常是 D 触发器，用于存储电路的“当前状态”(Current State)。它们全部由同一个系统时钟 (clk) 驱动。
2.  **组合逻辑 (Combinational Logic)**：
    * **下一状态逻辑 (Next-State Logic)**：根据“当前状态”和“外部输入”，计算出“下一状态”(Next State)。
    * **输出逻辑 (Output Logic)**：根据“当前状态”（和“外部输入”，取决于 FSM 类型）计算出“当前输出”。

### FSM 模型

状态机是对时序逻辑行为的抽象。它有两个经典模型：

1.  **Mealy 型状态机 (Mealy Machine)**：
    * **输出**：取决于**当前状态**和**外部输入**。
    * **特点**：输出对外部输入的变化是**异步**响应的（会立即变化，可能产生毛刺）。响应速度快。
    * VHDL 中，输出逻辑通常在一个组合进程中，敏感列表包含 `current_state` 和 `inputs`。

2.  **Moore 型状态机 (Moore Machine)**：
    * **输出**：**仅仅**取决于**当前状态**。
    * **特点**：输出是**同步**的，只在时钟边沿（状态切换时）才可能发生变化。输出稳定，无毛刺。
    * VHDL 中，输出逻辑可以在组合进程中（敏感列表只包含 `current_state`），或者在时序进程中（与状态寄存器一起，实现**寄存器型输出**）。

**选择**：Moore 机输出更稳定、安全，易于时序分析。Mealy 机响应更快，可能节省一个时钟周期。在 FPGA 设计中，优先推荐使用 Moore 机。

## 5.2 设计实例：3 位计数器

第 4.5 节中的 3 位计数器是一个简单的时序电路。我们也可以将其理解为一个 Moore 型 FSM。

* **状态 (State)**：计数值 (000, 001, ..., 111)。
* **输入 (Input)**：使能 (en), 复位 (rst_n)。
* **输出 (Output)**：计数值 (count)。
* **下一状态逻辑**：`next_state = current_state + 1` (当 en='1')
* **输出逻辑**：`output = current_state` (Moore 型)
```VHDL
-- 实体 (与 4.5 节相同)
LIBRARY ieee;
USE ieee.std_logic_1164.ALL;
USE ieee.numeric_std.ALL;

ENTITY counter_3bit_fsm IS
    PORT (
        clk    : IN  STD_LOGIC;
        rst_n  : IN  STD_LOGIC; -- 同步复位
        en     : IN  STD_LOGIC;
        count  : OUT STD_LOGIC_VECTOR(2 DOWNTO 0)
    );
END ENTITY counter_3bit_fsm;

-- 结构体 (使用 FSM 风格重写)
ARCHITECTURE fsm_style OF counter_3bit_fsm IS
    -- 1. 定义状态 (使用 UNSIGNED)
    SIGNAL current_state, next_state : UNSIGNED(2 DOWNTO 0);
BEGIN
    -- 进程 1：状态寄存器 (时序逻辑)
    -- 描述状态如何随时间更新
    PROCESS (clk)
    BEGIN
        IF rising_edge(clk) THEN
            IF rst_n = '0' THEN
                current_state <= (OTHERS => '0'); -- S0
            ELSE
                current_state <= next_state; -- 更新状态
            END IF;
        END IF;
    END PROCESS;

    -- 进程 2：下一状态逻辑 (组合逻辑)
    -- 描述状态如何转移
    PROCESS (current_state, en)
    BEGIN
        -- 默认保持当前状态
        next_state <= current_state; 
        
        IF en = '1' THEN
            next_state <= current_state + 1;
        END IF;
    END PROCESS;

    -- 进程 3：输出逻辑 (组合逻辑 - Moore 型)
    -- 描述输出
    PROCESS (current_state)
    BEGIN
        count <= STD_LOGIC_VECTOR(current_state);
    END PROCESS;
    
    -- (注意：对于计数器，进程 3 可以简化为并发语句)
    -- count <= STD_LOGIC_VECTOR(current_state);

END ARCHITECTURE fsm_style;
```

## 5.3 时序电路描述方法

### 5.3.1 ASM 图的组成

**ASM (Algorithmic State Machine) 图** 是一种用于描述 FSM 行为的流程图。它比状态转移图提供了更多信息（特别是 Mealy 输出）。

ASM 图由三种基本框组成：

1.  **状态框 (State Box)**：
    * **形状**：矩形。
    * **含义**：表示一个**状态**。
    * **内容**：状态名，以及在该状态下为高电平的 **Moore 型输出**。
    * **规则**：每个 ASM 块**必须**有一个状态框作为入口。

2.  **判断框 (Decision Box)**：
    * **形状**：菱形。
    * **含义**：表示一个**外部输入**的判断 (IF-THEN-ELSE)。
    * **内容**：判断条件（如 `start = '1'`）。
    * **规则**：有一个入口，两个出口（'1'/True 和 '0'/False）。

3.  **条件输出框 (Conditional Output Box)**：
    * **形状**：椭圆形或圆角矩形。
    * **含义**：表示一个 **Mealy 型输出**。
    * **内容**：在该条件下为高电平的输出信号。
    * **规则**：当输入满足特定条件时，该输出有效。它必须跟在判断框后面。

### 5.3.2 设计实例：自动售邮票机

**需求**：设计一个自动售邮票机。
* 邮票 2.5 元。
* 机器接受 0.5 元、1 元、2 元的硬币。
* 机器会找零 0.5 元（如果需要）。
* 输入信号：`coin_0_5` (0.5元), `coin_1_0` (1元), `coin_2_0` (2元)。
* 输出信号：`stamp` (出邮票), `change` (找零 0.5 元)。
* 假设：每次只投入一个硬币；投币时，对应信号拉高 1 个时钟周期。

**状态定义 (Moore 型)**：
* `S_IDLE` (0 元)
* `S_0_5` (0.5 元)
* `S_1_0` (1.0 元)
* `S_1_5` (1.5 元)
* `S_2_0` (2.0 元)
* `S_STAMP` (出邮票状态，金额 >= 2.5 元)
* `S_CHANGE` (出邮票并找零，金额 = 3.0 元)

(为了简化，这里使用 VHDL 直接实现，ASM 图是这种逻辑的图形化表示)
```VHDL
-- 实体
ENTITY stamp_vending_machine IS
    PORT (
        clk     : IN  STD_LOGIC;
        rst_n   : IN  STD_LOGIC;
        coin_0_5: IN  STD_LOGIC;
        coin_1_0: IN  STD_LOGIC;
        coin_2_0: IN  STD_LOGIC;
        stamp   : OUT STD_LOGIC;
        change  : OUT STD_LOGIC
    );
END ENTITY stamp_vending_machine;

-- 结构体 (使用 "三段式" FSM 模板)
ARCHITECTURE fsm OF stamp_vending_machine IS
    -- 1. 定义状态 (枚举类型)
    TYPE T_STATE IS (S_IDLE, S_0_5, S_1_0, S_1_5, S_2_0, S_STAMP, S_CHANGE);
    SIGNAL current_state, next_state : T_STATE;

BEGIN
    -- 进程 1：状态寄存器 (时序逻辑)
    PROCESS (clk, rst_n)
    BEGIN
        IF rst_n = '0' THEN
            current_state <= S_IDLE;
        ELSIF rising_edge(clk) THEN
            current_state <= next_state;
        END IF;
    END PROCESS;

    -- 进程 2：下一状态逻辑 (组合逻辑)
    PROCESS (current_state, coin_0_5, coin_1_0, coin_2_0)
    BEGIN
        -- 默认下一状态是当前状态 (保持)
        next_state <= current_state;

        CASE current_state IS
            WHEN S_IDLE => -- 0 元
                IF    coin_0_5 = '1' THEN next_state <= S_0_5;
                ELSIF coin_1_0 = '1' THEN next_state <= S_1_0;
                ELSIF coin_2_0 = '1' THEN next_state <= S_2_0;
                END IF;
            WHEN S_0_5 => -- 0.5 元
                IF    coin_0_5 = '1' THEN next_state <= S_1_0;
                ELSIF coin_1_0 = '1' THEN next_state <= S_1_5;
                ELSIF coin_2_0 = '1' THEN next_state <= S_STAMP; -- 2.5 元
                END IF;
            WHEN S_1_0 => -- 1.0 元
                IF    coin_0_5 = '1' THEN next_state <= S_1_5;
                ELSIF coin_1_0 = '1' THEN next_state <= S_2_0;
                ELSIF coin_2_0 = '1' THEN next_state <= S_CHANGE; -- 3.0 元
                END IF;
            WHEN S_1_5 => -- 1.5 元
                IF    coin_0_5 = '1' THEN next_state <= S_2_0;
                ELSIF coin_1_0 = '1' THEN next_state <= S_STAMP; -- 2.5 元
                ELSIF coin_2_0 = '1' THEN next_state <= S_CHANGE; -- 3.5 元 (设计错误？)
                -- (假设 3.5 元也只找 0.5, 吞 0.5)
                -- ELSIF coin_2_0 = '1' THEN next_state <= S_CHANGE; 
                END IF;
            WHEN S_2_0 => -- 2.0 元
                IF    coin_0_5 = '1' THEN next_state <= S_STAMP; -- 2.5 元
                ELSIF coin_1_0 = '1' THEN next_state <= S_CHANGE; -- 3.0 元
                -- ELSIF coin_2_0 = '1' ...
                END IF;
                
            WHEN S_STAMP => -- 出邮票
                next_state <= S_IDLE; -- 完成，返回 IDLE
            WHEN S_CHANGE => -- 出邮票 + 找零
                next_state <= S_IDLE; -- 完成，返回 IDLE
                
            WHEN OTHERS =>
                next_state <= S_IDLE;
        END CASE;
    END PROCESS;
    
    -- 进程 3：输出逻辑 (组合逻辑 - Moore 型)
    PROCESS (current_state)
    BEGIN
        -- 默认输出
        stamp  <= '0';
        change <= '0';
        
        CASE current_state IS
            WHEN S_STAMP =>
                stamp <= '1';
            WHEN S_CHANGE =>
                stamp <= '1';
                change <= '1';
            WHEN OTHERS =>
                -- 保持默认值 0
                NULL;
        END CASE;
    END PROCESS;

END ARCHITECTURE fsm;
```
### 5.3.3 状态分配与编码

FSM 中的状态（如 `S_IDLE`）是抽象的，综合器必须将其分配 (Encoding) 为具体的二进制值（`000`, `001` 等）。

* **VHDL**：使用枚举类型（如 `TYPE T_STATE IS (S_IDLE, ...)`），综合器会自动选择一种编码。
* **手动编码**：可以使用 `CONSTANT` 定义状态，例如：
    `CONSTANT S_IDLE : STD_LOGIC_VECTOR(2 DOWNTO 0) := "000";`
    `CONSTANT S_0_5  : STD_LOGIC_VECTOR(2 DOWNTO 0) := "001";`

**常见编码方式**：

1.  **二进制编码 (Binary)**：
    * `000`, `001`, `010`, `011` ...
    * **优点**：最节省触发器 (N 个状态需要 ceil(log2(N)) 个触发器)。
    * **缺点**：状态切换时可能有多位变化（如 `011` -> `100`），下一状态逻辑可能更复杂，延迟更高。

2.  **格雷码 (Gray Code)**：
    * `000`, `001`, `011`, `010` ...
    * **优点**：相邻状态转换时只有 1 位变化，功耗较低，毛刺风险小。
    * **缺点**：下一状态逻辑可能比二进制更复杂。

3.  **独热码 (One-Hot)**：
    * `0001` (S0), `0010` (S1), `0100` (S2), `1000` (S3) ...
    * **优点**：N 个状态需要 N 个触发器。状态比较非常简单（只需检查 1 位）。下一状态逻辑和输出逻辑通常最简单，速度最快，延迟最低。
    * **缺点**：占用触发器数量最多。
    * **应用**：**FPGA 设计中的首选**。FPGA 内部有海量的触发器，但组合逻辑（LUT）相对有限。One-hot 编码可以牺牲触发器换取更简单、更快的组合逻辑。

### 5.3.4 状态最少化 (State Minimization)

* **概念**：在设计 FSM 时，我们可能会定义出一些**等价状态 (Equivalent States)**。
* **等价状态**：指两个状态，在所有可能的输入序列下，它们产生的输出序列完全相同。
* **最少化**：通过合并等价状态，减少状态总数。
* **优点**：在 CPLD 或早期 ASIC 设计中，可以节省触发器和逻辑资源。
* **现代实践**：在 FPGA 设计中，状态最少化**并不总是**有益的。
    * 使用 One-Hot 编码时，状态多并不会增加下一状态逻辑的复杂性。
    * 有时，保留“冗余”状态反而可以使逻辑更简单、速度更快。
    * 现代综合工具在综合时会自动进行一定程度的优化。

## 5.4 ASM 图的硬件实现

ASM 图或状态转移图在 VHDL 中最推荐的实现方式就是 **"三段式 FSM" (Three-Process FSM)**，如 5.3.2 售票机示例所示。

1.  **进程 1: 状态寄存器 (时序逻辑)**
    * 负责状态的同步更新（`current_state <= next_state;`）。
    * 这是电路中的**存储元件**（D 触发器）。
    * `PROCESS(clk, rst_n)`

2.  **进程 2: 下一状态逻辑 (组合逻辑)**
    * 负责计算 `next_state`。
    * `CASE current_state IS ...`
    * 这是电路中的**下一状态组合逻辑**。
    * `PROCESS(current_state, all_inputs...)`
    * 这对应了目录中的 **"多路选择器 (Multiplexer) 法"**，因为 `CASE` 语句通常会被综合器实现为一组 MUX。

3.  **进程 3: 输出逻辑 (组合逻辑 或 时序逻辑)**
    * 负责根据 `current_state`（Moore）或 `current_state, inputs`（Mealy）计算输出。
    * 这是电路中的**输出组合逻辑**。
    * `PROCESS(current_state)` (Moore) 或 `PROCESS(current_state, inputs)` (Mealy)。
    * （ 高级技巧：也可以在进程 1 中实现寄存器型 Moore 输出，使输出与时钟同步，消除毛刺。）

* **目录中的 "计数器法" (Counter Method)**：
    * 这是一种特殊的 FSM 实现。
    * 当状态转移是严格的线性序列时（如 `S0 -> S1 -> S2 -> ...`），FSM 的核心就是一个计数器。
    * 下一状态逻辑（进程 2）被简化为 `next_state <= current_state + 1;`
    * 输出逻辑（进程 3）则使用一个译码器，根据计数值（`current_state`）译码出所需的输出。
    * 这种方法适用于状态转移固定、分支较少的 FSM。