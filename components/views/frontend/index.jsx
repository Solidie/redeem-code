import React, { useState, useContext } from "react";
import {createRoot} from 'react-dom/client';

import {MountPoint} from 'solidie-materials/mountpoint.jsx';
import {getElementDataSet, __, isEmpty, data_pointer} from 'solidie-materials/helpers.jsx';
import {TextField} from 'solidie-materials/text-field/text-field';
import {LoadingIcon} from 'solidie-materials/loading-icon/loading-icon';
import {request} from 'solidie-materials/request';
import {ContextToast} from 'solidie-materials/toast/toast';

const {user:{id: user_id}} = window[data_pointer];

function RedeemForm({login_url}) {

	const {ajaxToast} = useContext(ContextToast);

	const [state, setState] = useState({
		code: '',
		applying: false
	});

	const setVal=(name, value)=>{
		setState({
			...state,
			[name]: value
		})
	}

	const applyCode=()=>{
		
		setVal('applying', true);

		request('applyRedeemCode', {code: state.code}, resp=>{
			if ( resp.success ) {
				window.location.replace(resp.data.redirect_to);
			} else {
				ajaxToast(resp);
				setVal('applying', false);
			}
		})
	}

	return <div 
		style={{width: '400px', maxWidth: '100%', margin: '0 auto'}}
	>
		<div
			className={'d-flex align-items-center column-gap-15'.classNames()}
		>
			<div className={'flex-1'.classNames()}>
				<TextField 
					value={state.code}
					onChange={v=>setVal('code', v)}
					placeholder={__('Enter Redeem Code')}
				/>
			</div>
			<div>
				<button 
					className={'button button-primary'.classNames()} 
					disabled={state.applying || isEmpty(state.code) || !user_id}
					onClick={applyCode}
				>
					{__('Apply')} <LoadingIcon show={state.applying}/>
				</button>
			</div>
		</div>
		
		{
			user_id ? null :
			<div className={'margin-top-5 color-text-60'.classNames()}>
				You need to <a href={login_url} className={'color-material-70 interactive'.classNames()}>login</a> first
			</div>
		}
	</div>
}

const element = document.getElementById('redeem_code_apply_form');
if ( element ) {
	createRoot(element).render(
		<MountPoint>
			<RedeemForm {...getElementDataSet(element)}/>
		</MountPoint>
	)
}
