declare class Canvas {
    parent: HTMLElement | undefined;
    canvas: HTMLCanvasElement;
    private ctx;
    private w;
    private h;
    private textOptions;
    /**
     * @param width
     * Width of canvas in pixels. Defaults to window width.
     * @param height
     * Height of canvas in pixels. Defaults to window height.
     * @param parent
     * If parent is an HTML element,(like div or body),the created HTMLCanvasElement will be appended to it.
     * @param transparent
     * If true (default),the created canvas will be able to draw transparent/translucent colors or images.
     */
    constructor(width: number, height: number, parent: HTMLElement | undefined, transparent?: boolean);
    set width(width: number);
    get width(): number;
    set height(height: number);
    get height(): number;
    /**
     * Resizes the canvas to the provided dimensions,or the size provided by the CSS attributes.
     * @param width
     * Width in pixels. If not truthy,will be the window width.
     * @param height
     * Height in pixels. If not truthy,will be the window height.
     */
    resize(width: number, height: number): void;
    /**
     * Resizes the canvas to the dimensions of the parent element (Will probably throw error if the parent provided in the constructor was not a HTMLElement)
     */
    resizeToParent(): void;
    /**
     * resizes the canvas to the dimensions of the window
     */
    resizeToWindow(): void;
    /**
     * Sets the stroke and fill color of subsequent operations
     * @param color
     * Hex value of the color (like #d4c00b)
     */
    setDrawColor(color: string): void;
    /**
     * Sets the stroke color of subsequent operations
     * @param color
     * Hex value of the color (like #d4c00b)
     */
    setStrokeColor(color: string): void;
    /**
     * Sets the fill color of subsequent operations
     * @param {string} color
     * Hex value of the color (like #d4c00b)
     */
    setFillColor(color: string): void;
    /**
     * Sets the stroke width of subsequent operations
     * @param {number} width
     * Stroke width in pixels
     */
    setStrokeWidth(width: number): void;
    /**
     * Wrapper for ctx.beginPath.
     */
    beginPath(): void;
    /**
     * Wrapper for ctx.moveTo.
     * Moves to (x,y). This starts a new line/fill
     */
    moveTo(x: number, y: number): void;
    /**
     * Wrapper for ctx.lineTo
     * Makes a line to (x,y)
     */
    lineTo(x: number, y: number): void;
    /**
     * Wrapper for ctx.arc
     * Draws an arc centered at (x,y) from a1 to a2 full turns clockwise with radius
     * r. If counterclockwise=true,the arc will be inverted (not mirrored)
     */
    arc(x: number, y: number, r: number, a1: number, a2: number, counterclockwise?: boolean): void;
    /**
     * Wrapper for ctx.stroke
     * Draws the path onto the canvas
     */
    stroke(): void;
    /**
     * Wrapper for ctx.fill
     * Fills in the area outlined in the path
     */
    fill(): void;
    /**
     * Wrapper for ctx.closePath
     */
    closePath(): void;
    /**
     * Clears canvas. If color is provided,fill canvas with color
     * @param color
     * Hex value of the color (like #d4c00b). If not provided,the resulting canvas is transparent if transparency is enabled or white otherwise.
     */
    clear(color: string): void;
    /**
     * Draws a line from x1 to y1.
     */
    line(x1: number, y1: number, x2: number, y2: number): void;
    /**
     * Fills a rectancle with color. (x1,y1) is the top left corner and (x2,y2) is the bottom right corner.
     */
    fillRect(x1: number, y1: number, x2: number, y2: number): void;
    /**
     * Draws a rectancle. (x1,y1) is the top left corner and (x2,y2) is the bottom right corner.
     */
    drawRect(x1: number, y1: number, x2: number, y2: number): void;
    /**
     * Fills a square with top left corner at (x1,y1) and width
     */
    fillSquare(x: number, y: number, width: number): void;
    /**
     * Draws a square with top left corner at (x,y) and width
     */
    square(x: number, y: number, width: number): void;
    /**
     * Fills a circle with center (x,y) and radius r
     */
    fillCircle(x: number, y: number, r: number): void;
    /**
     * Draws a circle with center (x,y) and radius r
     */
    circle(x: number, y: number, r: number): void;
    /**
     * Fills an arc centered at (x,y) from a1 to a2 full turns clockwise with radius
     * r. If counterclockwise=true,the arc will be inverted (not mirrored)
     */
    fillArc(x: number, y: number, r: number, a1: number, a2: number, counterclockwise?: boolean): void;
    /**
     * Draws an arc centered at (x,y) from a1 to a2 full turns clockwise with radius
     * r. If counterclockwise=true,the arc will be inverted (not mirrored)
     */
    drawArc(x: number, y: number, r: number, a1: number, a2: number, counterclockwise?: boolean): void;
    /**
     * Fills an double arc centered at (x,y) from a1 to a2 full turns clockwise with radii
     * r1 and r2. If counterclockwise=true,the arc will be inverted (not mirrored)
     */
    fillDoubleArc(x: number, y: number, r1: number, r2: number, a1: number, a2: number, counterclockwise?: boolean): void;
    /**
     * Sets font style
     */
    setFont(family: "Arial" | "courier" | "cursive" | "fantasy" | "monospace" | "sans-serif" | "serif" | "system-ui" | undefined, italic: boolean | undefined, bold: boolean | undefined, line_height: string | number | undefined, small_caps: boolean | undefined): void;
    /**
     * Fill text with top left corner at (x,y)
     * @param txt
     * The text to display
     * @param size
     * The font size in pixels
     * @param  font
     * A string parsed like a CSS font property (like "italic bold 16px Times";)
     */
    fillText(txt: string, x: number, y: number, size: number): void;
    /**
     * Outline text with top left corner at (x,y)
     * @param txt
     * The text to display
     * @param size
     * The font size in pixels
     * @param font
     * A string parsed like a CSS font property (like "italic bold 16px Times";)
     */
    strokeText(txt: string, x: number, y: number, size: number): void;
    /**
     * draws a polygon centered at center
     * @param center
     * center of polygon
     * @param points
     * verticies of polygon
     */
    polygon(center: [number, number], points: [number, number][]): void;
    /**
     * fills a polygon centered at center
     * @param center
     * center of polygon
     * @param points
     * verticies of polygon
     */
    fillPolygon(center: [number, number], points: [number, number][]): void;
    /**
     * Draws a squircle
     * @param x
     * x-coordinate of the squircle center
     * @param y
     * y-coordinate of the squircle center
     * @param width
     * width of squircle
     * @param r
     * radius of rounded corners
     */
    squircle(x: number, y: number, width: number, r?: number): void;
    /**
     * Fills a squircle
     * @param x
     * x-coordinate of the squircle center
     * @param y
     * y-coordinate of the squircle center
     * @param width
     * width of squircle
     * @param r
     * radius of rounded corners
     */
    fillSquircle(x: number, y: number, width: number, r?: number): void;
    /**
     * Draws a curve through 2 or more points
     * @param points
     * points to draw the curve through
     */
    spline(points: [number, number][]): void;
    /**
     * Draws a bezier curve with 3 control points
     * @param p1
     * first control point
     * @param p2
     * second control point
     * @param p3
     * third control point
     */
    bezier(p1: [number, number], p2: [number, number], p3: [number, number]): void;
    /**
     * Draws unscaled image with top left corner at (x,y)
     */
    drawImage(img: HTMLImageElement | HTMLCanvasElement, x: number, y: number): void;
    /**
     * Draws an image scaled by a factor with top left corner at (x,y)
     */
    drawScaledImage(img: HTMLImageElement | HTMLCanvasElement, x: number, y: number, factor?: number): void;
    /**
     * Draws an image scaled to width (preserving the aspect ratio) with top left corner at (x,y)
     */
    drawImageWithWidth(img: HTMLImageElement | HTMLCanvasElement, x: number, y: number, destwidth: number): void;
    /**
     * Draws an image scaled to height (preserving the aspect ratio) with top left corner at (x,y)
     */
    drawImageWithHeight(img: HTMLImageElement | HTMLCanvasElement, x: number, y: number, destheight: number): void;
    /**
     * Draws an image on a rect with top left corner (x1,y1) and bottom right corner (x2,y2)
     */
    drawImageOnRect(img: HTMLImageElement | HTMLCanvasElement, x1: number, y1: number, x2: number, y2: number): void;
    /**
     * Wrapper for CanvasRenderingContext2D.save()
     * Saves the current state to a stack
     */
    pushState(): void;
    /**
     * Wrapper for CanvasRenderingContext2D.restore()
     * Restores the last state on the stack and pops it from the stack
     */
    restoreState(): void;
    /**
     * rotate context by angle around (x,y) or (0,0) if not present
     * @param angle
     * angle in radians
     * @param clockwise
     * whether to rotate clockwise
     */
    rotate(angle: number, clockwise?: boolean, x?: number, y?: number): void;
    /**
     * translates context x units left and y units down
     */
    translate(x: number, y: number): void;
    /**
     * Calls f(current time,elapsed time in milliseconds) 60 times per second (or tries to...)
     * @param {Function} f-the function to be called
     */
    static createAnimation(f: (currTime: number, elapsedTime: number) => undefined | boolean): void;
}