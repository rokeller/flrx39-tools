import { useState } from 'react';

function Themes() {
    const [theme, setTheme] = useState('dark');

    document.body.className = 'theme-' + theme;

    function selectTheme(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, theme: string) {
        setTheme(theme);
        event.stopPropagation();
        event.preventDefault();
    }

    return <>
        <a href='#/' onClick={(event) => selectTheme(event, 'dark')}>dark</a>
        {' | '}
        <a href='#/' onClick={(event) => selectTheme(event, 'light')}>light</a>
    </>;
}

export default Themes;
