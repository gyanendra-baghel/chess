class Chess {
    constructor(id, size = 400) {
        this.elem = document.getElementById(id);
        this.elem.width = this.size = size;
        this.elem.height = size;
        this.addImages();
        this.ctx = this.elem.getContext("2d");
        this.ctx.strokeStyle = "#606060";
        this.ctx.strokeRect(5, 5, this.size - 10, this.size - 10);
        this.pawns = [];
        this.chance = "white";
        this.margin = 5;
    }
    start() {
        this.moves = [];
        this.defaultPawnPosition();
        this.addEventListeners(this.ctx);
        this.drawChessBoard(this.ctx);
    }
    drawChessBoard(ctx) {
        ctx.reset();
        var boxSize = (this.size - 10) / 8;
        for (let i = 0; i < 64; i++) {
            ctx.fillStyle = ((i + Math.floor(i / 8)) % 2) ? "#008000" : "#979797";
            ctx.fillRect(5 + boxSize * (i % 8), 5 + boxSize * Math.floor(i / 8), boxSize, boxSize);
        }
        this.pawns.forEach((pawn) => { if (pawn) this.drawPawn(pawn) });
    }
    drawPawn(pawn) {
        const boxSize = (this.size - 10) / 8;
        const name = pawn.name;
        const boxPosition = this.getBoxPosition(pawn.pos);

        this.ctx.globalAlpha = (pawn.team == this.chance) ? 1 : 0.6;
        const img = this.images[name];
        if (this.images[name].complete) {
            this.ctx.save();
            var mask = document.createElement("canvas"),
                maskCtx = mask.getContext("2d");
            mask.width = mask.height = boxSize;
            maskCtx.fillStyle = pawn.color;
            maskCtx.fillRect(0, 0, boxSize, boxSize);
            if (pawn.color != "white") {
                maskCtx.rotate(Math.PI);
                maskCtx.translate(-boxSize, -boxSize);
            }
            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(img, 0, 0, boxSize, boxSize);
            this.ctx.drawImage(mask, boxPosition.x + 10, boxPosition.y + 10, boxSize - 20, boxSize - 20);
        };
        this.ctx.restore();
    }
    getBoxPosition(boxPos) {
        var boxSize = (this.size - 10) / 8;
        return {
            x: (5 + boxSize * boxPos[0]),
            y: (5 + boxSize * boxPos[1])
        };
    }
    getPositionBox(pos) {
        const xBox = Math.floor(pos[0] / (this.size / 8)), yBox = Math.floor(pos[1] / (this.size / 8));
        return [xBox, yBox];
    }
    getBoxPawn(pos) {
        const boxNum = pos[0] + 8 * pos[1];
        for (let i = 0; i < 32; i++) {
            if (this.pawns[i] == null) continue;
            if (this.pawns[i].pos[0] == pos[0] && this.pawns[i].pos[1] == pos[1]) return this.pawns[i];
        }
        return null;
    }
    addEventListeners(ctx) {
        this.elem.onclick = (ev) => {
            const rect = this.elem.getClientRects()[0];
            const mouse = [
                Math.floor(ev.clientX - rect.left) - this.margin,
                Math.floor(ev.clientY - rect.top) - this.margin,
            ];

            if (mouse[0] >= 0 && mouse[1] >= 0) {
                const boxPosition = this.getPositionBox(mouse); // getting clicked box position
                let pawn = this.getBoxPawn(boxPosition); // getting clicked pawn 

                if (this.selectedPawn !== null && this.moves.length > 0) { // Pawn move
                    for (let i = 0; i < this.moves.length; i++) {
                        if (this.moves[i][0] === boxPosition[0] && this.moves[i][1] === boxPosition[1]) { // matching pawn
                            this.selectedPawn.push(boxPosition);
                            this.chance = this.chance == "white" ? "black" : "white";
                            if (pawn != null) {
                                this.pawns[pawn.id] = null;
                                pawn = null;
                            }
                            if (this.isKingCheckPawns(this.chance == "white" ? "black" : "white").length > 0) {
                                console.log(this.isKingCheckPawns(this.chance == "white" ? "black" : "white"));
                                alert("Won:" + this.chance);
                            }
                        }
                    }
                }
                this.drawChessBoard(ctx);
                this.moves = [];
                this.selectedPawn = null;
                if (pawn == null || pawn.team !== this.chance)
                    return;
                const moves = this.getPawnMove(pawn);
                this.selectedPawn = pawn;
                this.moves = moves;
                this.drawPawnMoves(ctx, moves)
            }
        };
    }
    drawPawnMoves(ctx, moves) {
        var boxSize = (this.size - 10) / 8;
        for (let i = 0; i < moves.length; i++) {
            var position = this.getBoxPosition(moves[i]);
            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.arc(position.x + boxSize / 2, position.y + boxSize / 2, Math.floor(boxSize - 5) / 4, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.closePath();
        }
    }

    defaultPawnPosition() {
        let name;
        for (let i = 0; i < 32; i++) {
            const team = Math.floor(i / 16) == 0 ? "white" : "black";
            if ([0, 7, 24, 31].includes(i)) name = "Elephant";
            else if ([1, 6, 25, 30].includes(i)) name = "Knight";
            else if ([2, 5, 26, 29].includes(i)) name = "Camel";
            else if ([4, 28].includes(i)) name = "Queen";
            else if ([3, 27].includes(i)) name = "King";
            else name = "Pawn";
            const boxNum = i < 16 ? i : i + 32;
            const boxPos = [
                boxNum % 8,
                Math.floor(boxNum / 8),
            ];
            this.pawns[i] = new Pawn(i, team, boxPos, name);
        }
    }

    getPawnMove(pawn) {
        const isWhite = pawn.team == "white",
            pawName = pawn.name,
            pos = pawn.pos;
        var position = [], posX, posY, pwn;
        if (pawName == "Pawn") {
            var posY = (isWhite ? 1 : -1) + pos[1];
            if (this.getBoxPawn([pos[0], posY]) == null) position.push([pos[0], posY]);
            if (isWhite && pos[1] == 1) {
                position.push([pos[0], 2 + pos[1]]);
            } else if (!isWhite && pos[1] == 6) {
                position.push([pos[0], pos[1] - 2]);
            }
            [-1, 1].forEach((val) => {
                pwn = this.getBoxPawn([pos[0] + val, posY]);
                if (pwn != null && pwn.team != pawn.team) {
                    position.push([pos[0] + val, posY]);
                }
            });
        } else if (pawName == "Knight") {
            var position = [], posX, posY, pwn;
            position.push([pos[0] - 1, pos[1] - 2], [pos[0] + 1, pos[1] - 2], [pos[0] - 1, pos[1] + 2], [pos[0] + 1, pos[1] + 2]);
            position.push([pos[0] - 2, pos[1] - 1], [pos[0] - 2, pos[1] + 1], [pos[0] + 2, pos[1] - 1], [pos[0] + 2, pos[1] + 1]);
        }
        if (pawName == "Elephant" || pawName == "Queen") {
            for (let i = pos[1] - 1; i >= 0; i--) {
                position.push([pos[0], i]);
                if (this.getBoxPawn([pos[0], i]) != null) i = -1;
            }
            for (let i = pos[1] + 1; i < 8; i++) {
                position.push([pos[0], i]);
                if (this.getBoxPawn([pos[0], i]) != null) i = 8;
            }
            for (let i = pos[0] + 1; i < 8; i++) {
                position.push([i, pos[1]]);
                if (this.getBoxPawn([i, pos[1]]) != null) i = 8;
            }
            for (let i = pos[0] - 1; i >= 0; i--) {
                position.push([i, pos[1]]);
                if (this.getBoxPawn([i, pos[1]]) != null) i = -1;
            }
        }
        if (pawName == "Camel" || pawName == "Queen") {
            for (let i = pos[0] - 1; i >= 0; i--) {
                posY = pos[1] - (pos[0] - i);
                position.push([i, posY]);
                if (this.getBoxPawn([i, posY]) != null) i = -1;
            }
            for (let i = pos[0] + 1; i < 8; i++) {
                posY = pos[1] + (pos[0] - i);
                position.push([i, posY]);
                if (this.getBoxPawn([i, posY]) != null) i = 8;
            }
            for (let i = pos[0] - 1; i >= 0; i--) {
                posY = pos[1] + (pos[0] - i);
                position.push([i, posY]);
                if (this.getBoxPawn([i, posY]) != null) i = -1;
            }
            for (let i = pos[0] + 1; i < 8; i++) {
                posY = pos[1] - (pos[0] - i);
                position.push([i, posY]);
                if (this.getBoxPawn([i, posY]) != null) i = 8;
            }
        }
        if (pawName == "King") {
            position.push([pos[0] - 1, pos[1] + 1], [pos[0] + 1, pos[1] + 1], [pos[0], pos[1] + 1]);
            position.push([pos[0] - 1, pos[1] - 1], [pos[0] + 1, pos[1] - 1], [pos[0], pos[1] - 1]);
            position.push([pos[0] - 1, pos[1]], [pos[0] + 1, pos[1]]);
            position = this.validMove(position, pawn.team);
        }
        return this.validMove(position, pawn.team);
    }
    isKingCheckPawns(chance) {
        const king = this.pawns[(chance == "white" ? 3 : 27)];
        let moves, checkPawn = [];
        const l = (chance == "white" ? 16 : 0);
        for (let i = l; i < l + 16; i++) {
            const pawn = this.pawns[i];
            if (!pawn) continue;
            moves = this.getPawnMove(pawn);
            moves.forEach((val) => {
                if (king.pos[0] == val[0] && king.pos[1] == val[1]) {
                    checkPawn.push(pawn);
                }

            });
        }
        return checkPawn;
    }
    validMove(moves, team) {
        moves = moves.filter((p) => {
            if (Math.min(...p) < 0 || Math.max(...p) > 7) return false;
            var pawn = this.getBoxPawn(p);
            if (pawn != null && pawn.team == team) return false;
            return true;
        });
        return moves;
    }
    checkMove(move) {
        const king = this.pawns[(this.chance == "white" ? 3 : 28)];
        let moves, isCheck = false;
        const l = (this.chance == "white" ? 16 : 0);
        for (let i = l; i < l + 16; i++) {
            const pawn = this.pawns[i];
            if (!pawn) continue;
            moves = this.getPawnMove(pawn);
            moves.forEach((val) => {
                if (king.pos[0] == val[0] && king.pos[1] == val[1]) {
                    isCheck = true;
                }
            });
        }
        return isCheck;
    }
    addImages() {
        this.images = {};
        Promise.all(["Pawn", "Camel", "King", "Queen", "Knight", "Elephant"].map((name) => {
            return fetch("./images/" + name + ".png").then((response) => response.blob()).then((blob) => {
                const img = document.createElement("img");
                img.src = URL.createObjectURL(blob);
                this.images[name] = img;
            })
        })).then(() => setTimeout(() => this.start(), 100));
    }
}
class Pawn {
    constructor(id, team, pos, name) {
        this.id = id;
        this.team = team;
        this.pos = pos;
        this.name = name;
        this.color = team === "white" ? "white" : "#1d441d";
    }
    push(pos) {
        this.pos = pos;
    }
}
