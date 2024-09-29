import React, { useState, useContext, useEffect } from "react";
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
import {TableStat} from 'solidie-materials/table-stat';
import {confirm} from 'solidie-materials/prompts';
import {Pagination} from 'solidie-materials/pagination/pagination';

function AddModal({onClose}) {

	const {product_id, variation_id} = useParams();
	const {ajaxToast} = useContext(ContextToast);

	const [state, setState] = useState({
		codes: '',
		prefix: '',
		limit: 50,
		saving: false,
		generate: false,
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

	const [state, setState] = useState({
		fetching: true,
		redeem_codes: [],
		segmentation: {},
		selected_codes: [],
		filters: {
			page: 1
		}
	});

	const prod_variations = products.find(p=>p.product_id==product_id)?.variations?.map?.(p=>{return {id: p.variation_id, label: p.variation_title}}) || [];

	const fetchCodes=()=>{
		
		setState({
			...state,
			fetching: true,
			selected_codes: []
		});

		request('fetchRedeemCodes', {product_id, variation_id, ...state.filters}, resp=>{
			
			const {success, data:{codes: redeem_codes=[], segmentation={}}} = resp;

			setState({
				...state,
				fetching: false,
				redeem_codes,
				segmentation
			});
		})
	}

	const toggle=(name, show=false) => {
		setToggleStates({...toggleState, [name]: show});
	}

	const setFilter=(name, value)=>{
		setState({
			...state,
			filters: {
				...state.filters,
				[name]: value
			}
		})
	}
	
	const setProduct=(product_id, variation_id)=>{
		navigate(`/codes/${product_id}/${variation_id ? `${variation_id}/` : ``}`);
	}

	const toggleSelect=(code_id)=>{
		
		let selected_codes = [...state.selected_codes];

		if (code_id) {
			if ( selected_codes.indexOf(code_id) > -1 ) {
				selected_codes = selected_codes.filter(c=>c!==code_id);
			} else {
				selected_codes.push(code_id)
			}
		} else {
			if ( selected_codes.length === state.redeem_codes.length ) {
				selected_codes = [];
			} else {
				selected_codes = state.redeem_codes.map(c=>c.code_id);
			}
		}

		setState({...state, selected_codes});
	}

	const deleteCodes=()=>{
		confirm(
			'Sure to delete?',
			()=>{
				request('deleteRedeemCodes', {code_ids: state.selected_codes}, resp=>{
					if ( resp.success ) {
						fetchCodes();
						return;
					}

					ajaxToast(resp);
				})
			}
		)
	}

	useEffect(()=>{
		fetchCodes();
	}, [product_id, variation_id, state.filters.page]);

	return <WpDashboardFullPage>

		{
			!toggleState.add_modal ? null : 
			<AddModal 
				onClose={(added)=>{
					toggle('add_modal', false); 
					if (added) { 
						fetchCodes(); 
					}
				}}
			/>
		}

		<div className={'padding-horizontal-15'.classNames()}>

			<h2 className={'font-weight-600'.classNames()}>
				{__('Redeem Codes')}
			</h2>
			
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
							value={parseInt(variation_id)}
							options={prod_variations}
							onChange={id=>setProduct(product_id, id)}
							placeholder={__('Select Variation')}
						/>
					}
				</div>
				<div className={'d-flex align-items-center column-gap-15'.classNames()}>
					{
						!state.selected_codes.length ? null : 
						<span className={'d-flex align-items-center column-gap-5 color-error cursor-pointer'.classNames()} onClick={deleteCodes}>
							<i className={'sicon sicon-trash font-size-18'.classNames()}></i>
							<span>
								{__('Delete')}
							</span>
						</span>
						
					}
					<span className={'d-flex align-items-center column-gap-5 color-material-80 cursor-pointer'.classNames()} onClick={()=>toggle('add_modal', true)}>
						<i className={'sicon sicon-add-square font-size-18'.classNames()}></i>
						<span>
							{__('Add Codes')}
						</span>
					</span>
				</div>
			</div>

			<table className={'table margin-top-15 margin-bottom-15'.classNames()}>
				<thead>
					<tr>
						<th>
							<input 
								type="checkbox" 
								checked={state.selected_codes.length && state.selected_codes.length===state.redeem_codes.length}
								onChange={e=>toggleSelect()}
							/>
						</th>
						<th>Code</th>
						<th>Customer</th>
						<th>Order</th>
						<th>Applied</th>
					</tr>
				</thead>
				<tbody>
					{
						state.redeem_codes.map(code=>{
							return <tr key={code.code_id}>
								<td data-th={__('Select')}>
									<input 
										type="checkbox" 
										checked={state.selected_codes.indexOf(code.code_id)>-1}
										onChange={e=>toggleSelect(code.code_id)}
									/>
								</td>
								<td data-th={__('Code')}>{code.redeem_code}</td>
								<td data-th={__('Customer')}>{code.display_name || <>&nbsp;</>}</td>
								<td data-th={__('Order')}>{code.order_id || <>&nbsp;</>}</td>
								<td data-th={__('Applied')}>{code.applied_time || <>&nbsp;</>}</td>
							</tr>
						})
					}
					<TableStat
						empty={isEmpty(state.redeem_codes)}
						loading={state.fetching}
						message={!product_id ? __('Please select a product first') : __('No redeem codes found')}
					/>
				</tbody>
			</table>

			<Pagination
				onChange={page=>setFilter('page', page)}
				pageNumber={state.segmentation.page}
				pageCount={state.segmentation.page_count}
			/>

			<div style={{maxWidth: '300px', margin: 'auto', marginTop: '15px', border: '1px solid #e0e0e0', padding: '15px', borderRadius: '5px', backgroundColor: 'white', textAlign: 'center'}}>
				<h3 className={'font-weight-600'.classNames()}>
					{__('Apply Form Shortcode')}
				</h3>
				<code>
					[redeem_code_apply_form]
				</code>
			</div>
		</div>
	</WpDashboardFullPage>
}