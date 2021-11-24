class coord {

    coords() {
        let rows = this.row1 - this.row0 + 1
        let cols = this.col1 - this.col0 + 1
        for (let i = 0; i < cols; i++) {
            let label = this.labelGen(this.xValue, i)
            const name = new PreciseText(label, this.style);
            name.resolution = 4
            name.anchor.set(0.5)
            let pos = this.top(this.row0, i + this.col0)
            name.position.set(pos[0], pos[1])
            this.ref.addChild(name)
        }
        for (let i = 0; i < rows; i++) {
            let label = this.labelGen(this.yValue, i)
            const name = new PreciseText(label, this.style);
            name.resolution = 4
            name.anchor.set(0.5, 0.5)
            let pos = this.left(i + this.row0, this.col0)
            name.position.set(pos[0], pos[1])
            this.ref.addChild(name)
        }
    }

    individual() {
        let rows = this.row1 - this.row0 + 1
        let cols = this.col1 - this.col0 + 1
        let tinyStyle = this.style.clone()
        tinyStyle.fontSize = this.size / 6
        for (let c = 0; c < cols; c++) {
            let colName = this.labelGen(this.xValue, c)
            for (let r = 0; r < rows; r++) {
                let rowName = this.labelGen(this.yValue, r)
                let label = `${colName}, ${rowName}`
                let name = new PreciseText(label, tinyStyle);
                name.resolution = 4

                let pos = canvas.grid.grid.getPixelsFromGridPosition(r + this.row0, c + this.col0)
                if (this.type > 1) {
                    pos[0] = pos[0] + this.w / 3
                    pos[1] = pos[1] + this.h / 8
                }
                name.position.set(pos[0], pos[1])
                this.label.addChild(name)
            }
        }
    }

    labelGen(val, i) {
        switch (val) {
            case "num": return `${i}`;
            case "let": {
                if (i < 26) return String.fromCharCode(65 + i)
                else {
                    return this.numToSSColumn(i)
                }
            }
        }
    }

    numToSSColumn(num) {
        var s = '', t;

        while (num > 0) {
            t = (num - 1) % 26;
            s = String.fromCharCode(65 + t) + s;
            num = (num - t) / 26 | 0;
        }
        return s || undefined;
    }

    top(row, col) {
        let pos = canvas.grid.grid.getPixelsFromGridPosition(row, col)
        pos[0] += this.w / 2 
        pos[1] = this.internal.top - this.off - this.size / 4
        return pos
    }

    left(row, col) {
        let pos = canvas.grid.grid.getPixelsFromGridPosition(row, col)
        pos[1] += this.type == 4 ? 0 : this.h / 2
        pos[0] = this.internal.left - this.off - this.size / 4
        return pos
    }

    mouseCoords() {
        const mouse = canvas.app.renderer.plugins.interaction.mouse;
        let pos = mouse.getLocalPosition(canvas.app.stage);
        let [row, col] = canvas.grid.grid.getGridPositionFromPixels(pos.x, pos.y)
        row -= this.row0
        col -= this.col0
        let rowName = this.labelGen(this.yValue, row)
        let colName = this.labelGen(this.xValue, col)
        let name = new PreciseText(`${colName}, ${rowName}`, this.style)
        name.resolution = 4
        name.anchor.set(0.2)
        name.position.set(pos.x, pos.y)
        let label = canvas.controls.addChild(name)
        setTimeout(() => { label.destroy() }, this.timeOut)
    }

    addListener() {
        canvas.stage.addListener("click", (function (event) {
            if (!game.keyboard._downKeys.has(game.settings.get("map-coords", "keybind"))) return
            this.mouseCoords();
        }).bind(this))
    }

    addContainer() {
        this.ref = canvas.controls.addChild(new PIXI.Container())
        this.label = canvas.controls.addChild(new PIXI.Container())
        this.ref.visible = true
        this.label.visible = false
    }

    toggle() {
        switch (this.state) {
            case 1: {
                this.ref.visible = true
                this.label.visible = true
                this.state = 2
            }
                break;
            case 2: {
                this.ref.visible = false
                this.label.visible = false
                this.state = 3
            }
                break;
            case 3: {
                this.ref.visible = true
                this.label.visible = false
                this.state = 1
            }
        }
    }

    constructor() {
        this.internal = canvas.dimensions.sceneRect;
        this.shiftX = canvas.dimensions.shiftX;
        this.shiftY = canvas.dimensions.shiftY;
        this.padX = canvas.dimensions.padX;
        this.padY = canvas.dimensions.padY;
        this.size = canvas.dimensions.size;
        this.style = CONFIG.canvasTextStyle.clone();
        this.style.fontSize = this.size / 2;
        let [row0, col0] = canvas.grid.grid.getGridPositionFromPixels(this.internal.left, this.internal.top);
        let [row1, col1] = canvas.grid.grid.getGridPositionFromPixels(this.internal.right, this.internal.bottom);
        this.row0 = row0
        this.row1 = row1
        this.col0 = col0
        this.col1 = col1
        this.off = game.settings.get("map-coords", "offset")
        this.xValue = game.settings.get("map-coords", "xValue")
        this.yValue = game.settings.get("map-coords", "yValue")
        this.start = game.settings.get("map-coords", "startPoint")
        this.timeOut = game.settings.get("map-coords", "timeOut")
        this.h = canvas.grid.grid.h
        this.w = canvas.grid.grid.w
        this.type = canvas.grid.type
        this.state = 1
        this.addContainer()
        this.coords()
        this.individual()
        this.addListener()
    }
}

function getSceneControlButtons(buttons) {
    let tokenButton = buttons.find(b => b.name == "measure")
    if (tokenButton) {
        tokenButton.tools.push({
            name: "map-coords",
            title: game.i18n.format("button.name"),
            icon: "far fa-map",
            visible: true,
            onClick: () => window.MapCoordinates.toggle(),
            button: true
        });
    }
}

Hooks.on('canvasReady', () => {
    if(canvas.grid.type === 0 ) return
    let map = new coord()
    window.MapCoordinates = map
});

Hooks.on('getSceneControlButtons', getSceneControlButtons)