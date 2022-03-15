import './style.css';
import './preloader.css';

export default function ScreenLoader(props){
    return (
        <div className='preloaderContainer'>
            <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
    );
}