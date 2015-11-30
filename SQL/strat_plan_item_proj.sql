SELECT  
@SELECT:DIM:USER_DEF:IMPLIED:ITEM:X.Dim:Dim@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.IntId:IntID@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.name:Name@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.Code:Code@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.Description:Description@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.PerspID:PerspID@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.Perspective:Perspective@, 	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.ITEM_LEVEL:ITEM_LEVEL@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.WEIGHT:WEIGHT@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.WEIGHTPERCENT:WEIGHTPERCENT@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.stage_id:stage_id@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.stage_name:stage_name@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.stage_number:stage_number@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.stage_count:stage_count@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.SCHEDULE_START:SCHEDULE_START@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.SCHEDULE_FINISH:SCHEDULE_FINISH@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.BASELINE_START:BASELINE_START@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.BASELINE_FINISH:BASELINE_FINISH@,      
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.ITEMSTATUS:ITEMSTATUS@,        
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.business_alignment:business_alignment@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.overall_alignment:overall_alignment@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.corporate_alignment:corporate_alignment@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.risk_sl:risk_sl@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.schedule:schedule@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.schedule_sl:schedule_sl@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.schedule_pct:schedule_pct@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.schedule_pct_sl:schedule_pct_sl@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.cv_percent_sl:cv_percent_sl@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.effort_sl:effort_sl@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.issue_sl:issue_sl@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.change_sl:change_sl@,       
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.isInvestment:isInvestment@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.isItem:isItem@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.odf_object_code:odf_object_code@,	   
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.hg_has_children:hg_has_children@   
 FROM (
 select '1' @+@ SI.ID dim,      SI.ID IntID, SI.NAME, SI.CODE, SI.DESCRIPTION,      SP.ID PerspID, SP.NAME Perspective, 
		SI.ITEM_LEVEL, SI.ITEMSTATUS, SI.WEIGHT, SI.WEIGHTPERCENT,    	  
		null stage_id, null stage_name, trunc(avg(odf_proj.stage_number)) stage_number, max(odf_proj.stage_count) stage_count, 
		MIN(ODF_PROJ.SCHEDULE_START) SCHEDULE_START, MAX(ODF_PROJ.SCHEDULE_FINISH) SCHEDULE_FINISH, 
		MIN(ODF_PROJ.BASELINE_START) BASELINE_START, MAX(ODF_PROJ.BASELINE_FINISH) BASELINE_FINISH,
		avg(odf_proj.obj_alignment) business_alignment,	avg(odf_inv.STRAT_ALIGN_SCORE) overall_alignment, 
		avg(odf_inv.strat_corp_alignment) corporate_alignment, max(odf_proj.risk) risk_sl, max(inv_d.days_late) schedule, 
		max(inv_d.days_late) schedule_sl, max(inv_d.days_late_pct) schedule_pct, max(inv_d.days_late_pct) schedule_pct_sl, 
		max(odf_proj.obj_cost_pct_var) cv_percent_sl, max(odf_proj.obj_effort_var) effort_sl, max(issue.issue_sl) issue_sl, 
		max(change.change_exists) change_sl, 0 isInvestment, 1 isItem, null odf_object_code, 
		CASE WHEN ((SELECT COUNT(*) FROM ODF_CA_STRATEGIC_ITEM SI2 WHERE SI2.PARENTITEM = SI.ID)+ 
				   (select count(*) FROM odf_multi_Valued_lookups MVL 
					WHERE MVL.OBJECT = 'project' AND MVL.ATTRIBUTE = 'strat_sup_goals' AND MVL.VALUE=SI.ID)
				) > 0 THEN '1' @+@ SI.ID ELSE NULL END hg_has_children   
 FROM  odf_ca_Strategic_item SI     
	INNER   join ODF_CA_STRAT_TREE_FLAT ST   on st.parent_level=SI.item_level AND st.parent_item = SI.ID 
	LEFT OUTER   join odf_ca_strat_bsc_persp sp on sp.id = si.bscperspective     
	INNER   join odf_multi_valued_lookups MVL ON MVL.OBJECT = 'project' AND MVL.ATTRIBUTE = 'strat_sup_goals' AND MVL.VALUE = ST.CHILD_ITEM 
	INNER   join ODF_PROJECT_V2 odf_proj 	on odf_proj.odf_pk = MVL.PK_ID 	  
	INNER   join odf_inv_v2 odf_inv on odf_inv.odf_pk = odf_proj.odf_pk   
	INNER   JOIN  COP_INV_DAYS_LATE_V inv_d ON  odf_proj.odf_pk =  inv_d.investment_id 
	LEFT   OUTER JOIN cop_inv_rim_stoplights_v issue ON odf_proj.odf_pk = issue.investment_id 
	LEFT OUTER JOIN (SELECT c.pk_id project_id, COUNT(c.odf_pk) change_exists 
					FROM    odf_change_v2 c  
					WHERE c.status_code NOT IN ('CLOSED','RESOLVED') GROUP  BY c.pk_id) change ON odf_proj.odf_pk = change.project_id  
 WHERE   SI.ID = @WHERE:PARAM:XML:INTEGER:/data/id/@value@   AND   @NVL@(@WHERE:PARAM:USER_DEF:INTEGER:hg_row_id@,0) = 0   
 GROUP BY   SI.ID, SI.NAME, SI.CODE, SI.DESCRIPTION, SP.ID, SP.NAME, SI.ITEM_LEVEL, SI.ITEMSTATUS, SI.WEIGHT, SI.WEIGHTPERCENT, ST.PARENT_LEVEL
 
UNION

  select '1' @+@ SI.ID dim,      SI.ID IntID, SI.NAME, SI.CODE, SI.DESCRIPTION,      SP.ID PerspID, SP.NAME Perspective, 	  
		SI.ITEM_LEVEL, SI.ITEMSTATUS, SI.WEIGHT, SI.WEIGHTPERCENT,    	  
		null stage_id, null stage_name, trunc(avg(odf_proj.stage_number)) stage_number, max(odf_proj.stage_count) stage_count, 
 MIN(ODF_PROJ.SCHEDULE_START) SCHEDULE_START, MAX(ODF_PROJ.SCHEDULE_FINISH) SCHEDULE_FINISH, MIN(ODF_PROJ.BASELINE_START) BASELINE_START, MAX(ODF_PROJ.BASELINE_FINISH) BASELINE_FINISH,
  avg(odf_proj.obj_alignment) business_alignment,	   avg(odf_inv.STRAT_ALIGN_SCORE) overall_alignment,	   avg(odf_inv.strat_corp_alignment) corporate_alignment,       max(odf_proj.risk) risk_sl,       max(inv_d.days_late) schedule,       max(inv_d.days_late) schedule_sl,       max(inv_d.days_late_pct) schedule_pct,       max(inv_d.days_late_pct) schedule_pct_sl,       max(odf_proj.obj_cost_pct_var) cv_percent_sl,       max(odf_proj.obj_effort_var) effort_sl,       max(issue.issue_sl) issue_sl,       max(change.change_exists) change_sl,      0 isInvestment, 1 isItem, null odf_object_code,	CASE WHEN ((SELECT COUNT(*)   
 FROM  ODF_CA_STRATEGIC_ITEM SI2              
 WHERE   SI2.PARENTITEM = SI.ID) + 			(select count(*) 			  
 FROM  odf_multi_Valued_lookups MVL 			 
 WHERE   MVL.OBJECT = 'project' 					  AND   MVL.ATTRIBUTE = 'strat_sup_goals' 					  AND   MVL.VALUE=SI.ID)) > 0             THEN '1' @+@ SI.ID ELSE NULL END hg_has_children	    
 FROM  ODF_CA_STRATEGIC_ITEM SI   
	INNER   join ODF_CA_STRAT_TREE_FLAT ST   on st.parent_level=SI.item_level   AND   st.parent_item = SI.ID   
	LEFT OUTER   join odf_ca_strat_bsc_persp sp on sp.id = si.bscperspective     
	INNER   join odf_multi_valued_lookups MVL     ON MVL.OBJECT = 'project'       AND   MVL.ATTRIBUTE = 'strat_sup_goals'       AND   MVL.VALUE = ST.CHILD_ITEM     
	INNER   join ODF_PROJECT_V2 odf_proj  	on odf_proj.odf_pk = MVL.PK_ID 	  
	INNER   join odf_inv_v2 odf_inv on odf_inv.odf_pk = odf_proj.odf_pk   
	INNER    JOIN  COP_INV_DAYS_LATE_V inv_d              ON  odf_proj.odf_pk =  inv_d.investment_id LEFT   OUTER JOIN cop_inv_rim_stoplights_v issue      ON   odf_proj.odf_pk = issue.investment_id LEFT   OUTER JOIN (SELECT c.pk_id project_id,                           COUNT(c.odf_pk) change_exists                      
 FROM    odf_change_v2 c                     
 WHERE                       c.status_code NOT IN ('CLOSED','RESOLVED')                    GROUP  BY c.pk_id) change              ON   odf_proj.odf_pk = change.project_id  
 WHERE   SI.PARENTITEM=substr(@WHERE:PARAM:USER_DEF:INTEGER:hg_row_id@,2)   AND   SI.ACTIVE =1   
GROUP BY   SI.ID, SI.NAME, SI.CODE, SI.DESCRIPTION,      SP.ID, SP.NAME, SI.ITEM_LEVEL, SI.ITEMSTATUS, SI.WEIGHT, SI.WEIGHTPERCENT, ST.PARENT_LEVEL   

UNION

  	  	 select '2' @+@ odf_proj.odf_pk dim,       odf_proj.odf_pk IntID, odf_proj.NAME, odf_proj.UNIQUE_CODE Code, odf_proj.OBJ_OBJECTIVE DESCRIPTION,       Null PerspID, Null Perspective, 	  NULL ITEM_LEVEL, NULL ITEMSTATUS, NULL WEIGHT, NULL WEIGHTPERCENT, 	   
		 odf_proj.stage_code stage_id,       L1.NAME stage_name,       odf_proj.stage_number stage_number,       odf_proj.stage_count stage_count,       
		 ODF_PROJ.SCHEDULE_START, ODF_PROJ.SCHEDULE_FINISH, ODF_PROJ.BASELINE_START, ODF_PROJ.BASELINE_FINISH,
		 odf_proj.obj_alignment business_alignment,	   odf_inv.STRAT_ALIGN_SCORE overall_alignment,	   odf_inv.strat_corp_alignment corporate_alignment,       odf_proj.risk risk_sl,       inv_d.days_late schedule,       inv_d.days_late schedule_sl,       inv_d.days_late_pct schedule_pct,       inv_d.days_late_pct schedule_pct_sl,       odf_proj.obj_cost_pct_var cv_percent_sl,       odf_proj.obj_effort_var effort_sl,       issue.issue_sl issue_sl,       change.change_exists change_sl,	  1 isInvestment, 0 isItem, odf_proj.odf_object_code, null hg_has_children   
 FROM    ODF_PROJECT_V2 odf_proj 	  
	INNER   join odf_inv_v2 odf_inv on odf_inv.odf_pk = odf_proj.odf_pk 	  
	INNER   join cmn_lookups_v L1 on  L1.language_code=@WHERE:PARAM:LANGUAGE@   AND   L1.lookup_type='INV_STAGE_TYPE'   AND   L1.lookup_Code = ODF_PROJ.STAGE_CODE   
	INNER   JOIN ODF_MULTI_VALUED_LOOKUPS MVL     ON MVL.OBJECT = 'project'         AND   MVL.ATTRIBUTE = 'strat_sup_goals'         AND   MVL.PK_ID=ODF_PROJ.ODF_PK         AND   MVL.VALUE = substr(@WHERE:PARAM:USER_DEF:INTEGER:hg_row_id@,2)   
	INNER   JOIN ODF_CA_STRATEGIC_ITEM SI on SI.ID = MVL.VALUE   
	LEFT OUTER   JOIN ODF_CA_STRAT_BSC_PERSP SP on SP.ID = SI.BSCPERSPECTIVE   
	INNER    JOIN  COP_INV_DAYS_LATE_V inv_d              ON  odf_proj.odf_pk =  inv_d.investment_id LEFT   OUTER JOIN cop_inv_rim_stoplights_v issue      ON   odf_proj.odf_pk = issue.investment_id LEFT   OUTER JOIN (SELECT c.pk_id project_id,                           COUNT(c.odf_pk) change_exists                      
 FROM    odf_change_v2 c                     
 WHERE                       c.status_code NOT IN ('CLOSED','RESOLVED')                    GROUP  BY c.pk_id) change              ON   odf_proj.odf_pk = change.project_id  
 WHERE  	@WHERE:SECURITY:PROJECT:odf_proj.odf_pk@ ) X  
 WHERE   @FILTER@