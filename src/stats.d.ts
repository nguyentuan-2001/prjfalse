declare class Stats {
    constructor();
    REVISION: number;
    dom: HTMLDivElement;
  
    showPanel(value: number): void;
    begin(): void;
    end(): number;
    update(): void;
  
    addPanel(panel: Stats.Panel): Stats.Panel;
  }
  
  declare namespace Stats {
    class Panel {
      constructor(name: string, foregroundColor: string, backgroundColor: string);
      dom: HTMLCanvasElement;
      update(value: number, maxValue: number): void;
    }
  }
  
  export = Stats;
  