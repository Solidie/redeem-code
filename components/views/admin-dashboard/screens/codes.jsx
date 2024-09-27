import React, { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {WpDashboardFullPage} from 'solidie-materials/backend-dashboard-container/full-page-container.jsx';
import {__, isEmpty, getRandomString} from 'solidie-materials/helpers.jsx';
import {DropDown} from 'solidie-materials/dropdown/dropdown';
import {Modal} from 'solidie-materials/modal';
import {TextField} from 'solidie-materials/text-field/text-field';
import {LoadingIcon} from 'solidie-materials/loading-icon/loading-icon';
import {NumberField} from 'solidie-materials/number-field/number-field';
import {request} from 'solidie-materials/request';
import {ContextToast} from 'solidie-materials/toast/toast';

function AddModal({onClose}) {

	const {product_id, variation_id} = useParams();
	const {ajaxToast} = useContext(ContextToast);

	const [state, setState] = useState({
		codes: '',
		prefix: '',
		limit: 50,
		saving: false,
		generate: false
	});

	const setVal=(name, value)=>{
		setState({
			...state,
			[name]: value
		});
	}

	const generateCodes=()=>{
		
		const codes = [];

		for ( let i=0; i<state.limit; i++ ) {
			
			let new_code;
			
			do {
				new_code = `${state.prefix}${getRandomString()}`;
			} while ( codes.indexOf(new_code) >-1 );

			codes.push(new_code);
		}

		setVal('codes', codes.join('\n'));
	}

	const saveCodes=()=>{
		
		setVal('saving', true);

		request('saveRedeemCodes', {codes: state.codes.split('\n'), product_id, variation_id}, resp=>{
			if ( resp.success ) {
				onClose(true);
			} else {
				ajaxToast(resp);
				setVal('saving', false);
			}
		});
	}

	return <Modal 
		closeOnDocumentClick={true} 
		onClose={()=>onClose()}
	>
		<div className={'margin-bottom-15'.classNames()}>
			<strong className={'d-block margin-bottom-8'.classNames()}>
				{__('Add Redeem Codes')}
			</strong>
			<TextField
				type='textarea'
				placeholder={__('Paste your codes one per line or generate below')}
				value={state.codes}
				onChange={v=>setVal('codes', v)}/>

			<span className={'d-block margin-top-5 margin-bottom-5 cursor-pointer hover-underline'.classNames()} onClick={()=>setVal('generate', true)}>
				+ {__('Generate')}
			</span>

			{
				!state.generate ? null : 
				<div className={'d-flex align-items-center column-gap-15'.classNames()}>
					<div className={'flex-2'.classNames()}>
						<TextField
							placeholder={__('Prefix')}
							value={state.prefix}
							onChange={v=>setVal('prefix', v)}
						/>
					</div>
					<div className={'flex-2'.classNames()}>
						<NumberField
							placeholder={__('How many?')}
							value={state.limit}
							onChange={v=>setVal('limit', v)}
						/>
					</div>
					<div className={'flex-1'.classNames()}>
						<button className={'button button-outlined'.classNames()} onClick={generateCodes}>
							{__('Generate')}
						</button>
					</div>
				</div>
			}
		</div>
		
		<div className={'text-align-right'.classNames()}>
			<button 
				onClick={()=>onClose()} 
				className={'button button-outlined'.classNames()}
			>
				{__('Cancel')}
			</button>
			&nbsp;
			&nbsp;
			<button 
				className={'button button-primary'.classNames()} 
				onClick={()=>saveCodes()}
				disabled={isEmpty(state.codes) || state.saving}
			>
				{__('Save Codes')} <LoadingIcon show={state.saving}/>
			</button>
		</div>
	</Modal>
}

export function ScreenCodes({products=[]}) {

	const {product_id, variation_id} = useParams();
	const navigate = useNavigate();

	const [toggleState, setToggleStates] = useState({
		add_modal: false
	});

	const prod_variations = products.find(p=>p.product_id==product_id)?.variations?.map?.(p=>{return {id: p.variation_id, label: p.variation_title}}) || [];

	const fetchCodes=()=>{

	}

	const toggle=(name, show=false) => {
		setToggleStates({...toggleState, [name]: show});
	}
	
	const setProduct=(product_id, variation_id)=>{
		navigate(`/codes/${product_id}/${variation_id ? `${variation_id}/` : ``}`);
	}

	return <WpDashboardFullPage>

		{
			!toggleState.add_modal ? null : <AddModal onClose={(added)=>{toggle('add_modal', false); if (added) {fetchCodes();}}}/>
		}

		<div className={'padding-horizontal-15'.classNames()}>

			<h3>{__('Redeem Codes')}</h3>
			
			<div className={'d-flex align-items-center justify-content-space-between'.classNames()}>
				<div className={'d-flex align-items-center column-gap-15'.classNames()}>
					<DropDown
						value={parseInt(product_id)}
						options={products.map(p=>{return {id: p.product_id, label: p.product_title}})}
						onChange={id=>setProduct(id)}
						placeholder={__('Select Product')}
					/>

					{
						isEmpty(prod_variations) ? null :
						<DropDown
							value={variation_id}
							options={prod_variations}
							onChange={id=>setProduct(product_id, id)}
							placeholder={__('Select Variation')}
						/>
					}
				</div>
				<div className={'d-flex align-items-center'.classNames()}>
					<span onClick={()=>toggle('add_modal', true)}>Add Code</span>
				</div>
			</div>
		</div>
	</WpDashboardFullPage>
}