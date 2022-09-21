export interface Item {
  uid?: string;
  title: string;
  subtitle?: string;
  arg: string | string[];
  icon?: Icon;
  valid?: boolean;
  match?: string;
  autocomplete?: string;
  type?: string;
  mods?: Mod;
  action?: string | string[] | Action;
  text?: Text;
  quicklookurl?: string;
}

interface Text {
  copy: string;
  largetype: string;
}

interface Icon {
  type?: string;
  path: string;
}

interface Mod {
  [key: string]: {
    valid: string;
    arg: string;
    subtitle: string;
  };
}

interface Action {
  text: string[];
  url: string;
  file: string;
  auto: string;
}
