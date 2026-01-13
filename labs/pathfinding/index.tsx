"use client"; //

import React, { useState, useRef } from 'react';

type Algorithm = 'BFS' | 'DFS' | 'A*' | 'ACO';

interface Node {
    r: number;
    c: number;
    isStart: boolean;
    isEnd: boolean;
    isWall: boolean;
    isVisited: boolean;
    isPath: boolean;
    parent: Node | null;
    pheromone: number;
}

const ROWS = 21; // 适配迷宫建议行列
const COLS = 31;

export default function PathfindingLab() {
    const [grid, setGrid] = useState<Node[][]>(() => createGrid());
    const [algo, setAlgo] = useState<Algorithm>('BFS');
    const [isRunning, setIsRunning] = useState(false);
    const [iteration, setIteration] = useState(0);
    const isMousePressed = useRef(false);

    function createGrid(): Node[][] {
        return Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => ({
                r, c,
                isStart: r === 1 && c === 1,
                isEnd: r === ROWS - 2 && c === COLS - 2,
                isWall: false, isVisited: false, isPath: false,
                parent: null, pheromone: 0.1
            }))
        );
    }

    const getNeighbors = (node: Node, currentGrid: Node[][]): Node[] => {
        const neighbors: Node[] = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dr, dc] of directions) {
            const nr = node.r + dr, nc = node.c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                neighbors.push(currentGrid[nr][nc]);
            }
        }
        return neighbors;
    };

    // --- 递归分割迷宫生成 ---
    const generateMaze = async () => {
        if (isRunning) return;
        setIsRunning(true);
        const newGrid = createGrid();
        // 添加外墙
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) newGrid[r][c].isWall = true;
            }
        }
        setGrid([...newGrid]);

        const divide = async (rStart: number, rEnd: number, cStart: number, cEnd: number, orientation: 'H' | 'V') => {
            if (rEnd - rStart < 2 || cEnd - cStart < 2) return;
            const horizontal = orientation === 'H';
            const wallR = horizontal ? Math.floor(Math.random() * (rEnd - rStart - 1) / 2) * 2 + rStart + 1 : 0;
            const wallC = !horizontal ? Math.floor(Math.random() * (cEnd - cStart - 1) / 2) * 2 + cStart + 1 : 0;
            const holeR = !horizontal ? Math.floor(Math.random() * (rEnd - rStart + 1) / 2) * 2 + rStart : wallR;
            const holeC = horizontal ? Math.floor(Math.random() * (cEnd - cStart + 1) / 2) * 2 + cStart : wallC;

            for (let i = horizontal ? cStart : rStart; i <= (horizontal ? cEnd : rEnd); i++) {
                const cR = horizontal ? wallR : i;
                const cC = horizontal ? i : wallC;
                if ((cR !== holeR || cC !== holeC) && !newGrid[cR][cC].isStart && !newGrid[cR][cC].isEnd) {
                    newGrid[cR][cC].isWall = true;
                }
            }
            setGrid([...newGrid]);
            await new Promise(r => setTimeout(r, 10)); //

            if (horizontal) {
                await divide(rStart, wallR - 1, cStart, cEnd, (wallR - rStart > cEnd - cStart) ? 'H' : 'V');
                await divide(wallR + 1, rEnd, cStart, cEnd, (rEnd - wallR > cEnd - cStart) ? 'H' : 'V');
            } else {
                await divide(rStart, rEnd, cStart, wallC - 1, (rEnd - rStart > wallC - cStart) ? 'H' : 'V');
                await divide(rStart, rEnd, wallC + 1, cEnd, (rEnd - rStart > cEnd - wallC) ? 'H' : 'V');
            }
        };
        await divide(1, ROWS - 2, 1, COLS - 2, 'H');
        setIsRunning(false);
    };

    // --- 蚁群算法核心逻辑 (修复版) ---
    const runACO = async (currentGrid: Node[][]) => {
        const startNode = currentGrid[1][1];
        const endNode = currentGrid[ROWS - 2][COLS - 2];
        const maxIterations = 60;
        const antCount = 15; // 增加蚂蚁密度
        const evaporation = 0.9;

        for (let i = 0; i < maxIterations; i++) {
            setIteration(i + 1);
            const successfulPaths: Node[][] = [];

            for (let a = 0; a < antCount; a++) {
                let curr = startNode;
                const antPath: Node[] = [];
                const visited = new Set<string>();

                // 增加最大步数限制
                for (let step = 0; step < 200; step++) {
                    visited.add(`${curr.r}-${curr.c}`);
                    antPath.push(curr);

                    if (curr.r === endNode.r && curr.c === endNode.c) {
                        successfulPaths.push(antPath);
                        break;
                    }

                    const neighbors = getNeighbors(curr, currentGrid).filter(n => !n.isWall && !visited.has(`${n.r}-${n.c}`));
                    if (neighbors.length === 0) break;

                    // 计算轮盘赌权重：P = 信息素 * 启发式(1/距离)
                    const weights = neighbors.map(n => {
                        const dist = Math.abs(n.r - endNode.r) + Math.abs(n.c - endNode.c);
                        return Math.pow(n.pheromone, 1) * Math.pow(1 / (dist + 1), 2);
                    });

                    const total = weights.reduce((s, w) => s + w, 0);
                    let rand = Math.random() * total;
                    for (let idx = 0; idx < neighbors.length; idx++) {
                        rand -= weights[idx];
                        if (rand <= 0) {
                            curr = neighbors[idx];
                            break;
                        }
                    }
                }
            }

            // 信息素更新：挥发 + 增强
            currentGrid.forEach(row => row.forEach(n => {
                n.pheromone = Math.max(0.1, n.pheromone * evaporation);
            }));

            successfulPaths.forEach(path => {
                const reward = 10 / path.length; // 路径越短，奖励越高
                path.forEach(node => { node.pheromone += reward; });
            });

            setGrid([...currentGrid]);
            await new Promise(r => setTimeout(r, 15));
        }
    };

    // --- 基础寻路逻辑 ---
    const runStandardSearch = async (newGrid: Node[][]) => {
        const startNode = newGrid[1][1];
        const endNode = newGrid[ROWS - 2][COLS - 2];
        let openList: Node[] = [startNode];
        let found = false;

        while (openList.length > 0) {
            let current: Node | undefined;
            if (algo === 'BFS') current = openList.shift();
            else if (algo === 'DFS') current = openList.pop();
            else if (algo === 'A*') {
                openList.sort((a, b) => {
                    const distA = Math.abs(a.r - endNode.r) + Math.abs(a.c - endNode.c);
                    const distB = Math.abs(b.r - endNode.r) + Math.abs(b.c - endNode.c);
                    return distA - distB;
                });
                current = openList.shift();
            }

            if (!current || current.isWall || current.isVisited) continue;
            current.isVisited = true;

            if (current.r === endNode.r && current.c === endNode.c) { found = true; break; }

            const neighbors = getNeighbors(current, newGrid);
            for (const n of neighbors) {
                if (!n.isVisited && !n.isWall && n.parent === null) {
                    n.parent = current;
                    openList.push(n);
                }
            }
            setGrid([...newGrid]);
            await new Promise(r => setTimeout(r, 10));
        }

        if (found) {
            let backPath: Node | null = newGrid[ROWS - 2][COLS - 2].parent;
            while (backPath !== null) {
                const temp: Node = backPath;
                if (temp.isStart) break;
                temp.isPath = true;
                setGrid([...newGrid]);
                await new Promise(r => setTimeout(r, 30));
                backPath = temp.parent;
            }
        }
    };

    const startHandle = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setIteration(0);

        // 重置除墙壁和起点/终点外的状态
        const freshGrid = grid.map(row => row.map(node => ({
            ...node,
            isVisited: false,
            isPath: false,
            parent: null,
            pheromone: algo === 'ACO' ? 0.1 : node.pheromone // 蚁群重置信息素
        })));

        if (algo === 'ACO') {
            await runACO(freshGrid);
        } else {
            await runStandardSearch(freshGrid);
        }
        setIsRunning(false);
    };

    return (
        <div className="w-full flex justify-center py-8">
            <div className="max-w-4xl w-full px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 gap-4 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">寻路算法实验室</h2>
                        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">
                            状态: {isRunning ? `运行中 (${iteration})` : '准备就绪'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select value={algo} onChange={e => setAlgo(e.target.value as Algorithm)} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-lg text-sm outline-none">
                            <option value="BFS">广度优先 (BFS)</option>
                            <option value="DFS">深度优先 (DFS)</option>
                            <option value="A*">A* 寻路</option>
                            <option value="ACO">蚁群算法 (ACO)</option>
                        </select>
                        <button onClick={generateMaze} disabled={isRunning} className="px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50">迷宫生成</button>
                        <button onClick={() => setGrid(createGrid())} className="px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">重置</button>
                        <button onClick={startHandle} disabled={isRunning} className="px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg font-bold disabled:opacity-50 shadow-lg">开始实验</button>
                    </div>
                </div>

                <div
                    className="grid gap-[2px] bg-neutral-200 dark:bg-neutral-800 p-[2px] rounded-lg shadow-inner overflow-hidden cursor-crosshair border border-neutral-200 dark:border-neutral-800"
                    style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
                    onMouseDown={() => { isMousePressed.current = true }}
                    onMouseUp={() => { isMousePressed.current = false }}
                    onMouseLeave={() => { isMousePressed.current = false }}
                >
                    {grid.map((row, r) => row.map((node, c) => (
                        <div
                            key={`${r}-${c}`}
                            onMouseEnter={() => {
                                if (isMousePressed.current && !node.isStart && !node.isEnd && !isRunning) {
                                    const ng = [...grid];
                                    ng[r][c].isWall = true;
                                    setGrid(ng);
                                }
                            }}
                            style={{
                                backgroundColor: node.isStart ? '#10b981' :
                                    node.isEnd ? '#f43f5e' :
                                        node.isWall ? '#262626' :
                                            node.isPath ? '#fbbf24' :
                                                algo === 'ACO' ? `rgba(14, 165, 233, ${Math.pow(node.pheromone / 5, 0.7)})` :
                                                    node.isVisited ? 'rgba(56, 189, 248, 0.2)' : ''
                            }}
                            className="aspect-square bg-white dark:bg-neutral-900 rounded-[1px] transition-colors duration-150"
                        />
                    )))}
                </div>
            </div>
        </div>
    );
}