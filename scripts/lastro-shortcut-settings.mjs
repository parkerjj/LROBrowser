// Adds the entry preference to the existing native GraphicsOption window.
export function installLastroShortcutSettings(component, { document: doc, getEnabled, setEnabled, onError }) {
  if (component._lastroShortcutSettings) return component._lastroShortcutSettings;
  let checkbox, holidayCheckbox, saving = false;
  const sync = () => {
    if (checkbox && !saving) checkbox.checked = getEnabled() !== false;
    if (holidayCheckbox) holidayCheckbox.checked = globalThis.LastROHalloweenEffects?.disabled === true;
  };
  const originalInit = component.init, originalAppend = component.onAppend;
  component.init = function (...args) {
    originalInit?.apply(this, args);
    const table = this.getRoot()?.querySelector('#basic table');
    if (!table) throw new Error('Missing native graphics basic settings table');
    const row = doc.createElement('tr'), title = doc.createElement('td'), value = doc.createElement('td');
    const label = doc.createElement('label');
    title.textContent = '快捷入口';
    checkbox = doc.createElement('input');
    checkbox.type = 'checkbox'; checkbox.className = 'lastro-shortcut-entry';
    label.append(checkbox, doc.createTextNode('启用新版快捷入口'));
    label.title = '启用快捷工具面板；关闭后显示传送和挂机两个入口。';
    value.append(label); row.append(title, value); table.append(row);
    // The native graphics window already owns this table. Add the holiday
    // preference here instead of installing an observer or another ESC window.
    const holidayRow = doc.createElement('tr');
    const holidayTitle = doc.createElement('td');
    const holidayValue = doc.createElement('td');
    const holidayLabel = doc.createElement('label');
    holidayTitle.textContent = '节日特效';
    holidayCheckbox = doc.createElement('input');
    holidayCheckbox.type = 'checkbox';
    holidayCheckbox.className = 'lastro-halloween-disabled';
    holidayLabel.append(holidayCheckbox, doc.createTextNode('关闭节日特效'));
    holidayValue.append(holidayLabel);
    holidayRow.append(holidayTitle, holidayValue);
    table.append(holidayRow);
    const activeHolidayCheckbox = holidayCheckbox;
    activeHolidayCheckbox.addEventListener('change', () => {
      if (holidayCheckbox !== activeHolidayCheckbox) return;
      const controller = globalThis.LastROHalloweenEffects;
      if (!controller || controller.setDisabled(activeHolidayCheckbox.checked) === false)
        activeHolidayCheckbox.checked = controller?.disabled === true;
    });
    checkbox.addEventListener('change', async () => {
      if (saving) return;
      const enabled = checkbox.checked;
      saving = true; checkbox.disabled = true;
      try {
        if (await setEnabled(enabled) === false) throw new Error('快捷入口设置未保存，请重试。');
      } catch (error) { onError?.(error); }
      finally { saving = false; checkbox.disabled = false; sync(); }
    });
    sync();
  };
  component.onAppend = function (...args) { originalAppend?.apply(this, args); sync(); };
  component._lastroShortcutSettings = { sync };
  return component._lastroShortcutSettings;
}
