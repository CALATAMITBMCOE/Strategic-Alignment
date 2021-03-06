SELECT   
@SELECT:DIM:USER_DEF:IMPLIED:ITEM:X.Dim:Dim@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.IntId:ItemIntID@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.Name:ItemName@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.Code:ItemCode@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.Description:ItemDescription@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.Weight:Weight@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:round(X.WeightPercent * 100,0):WeightPercent@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.ITEM_LEVEL:ITEM_LEVEL@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.PerspId:PerspId@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.Perspective:Perspective@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.RelatedPlan:RelatedPlan@, 
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.ParentItemRelPlan:ParentItemRelPlan@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.RelatedPlanIntl:RelatedPlanIntl@, 
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.ParentItemRelPlanIntl:ParentItemRelPlanIntl@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.ITEMSTATUS:ITEMSTATUS@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.LAST_MEASURE_STATUS:LAST_MEASURE_STATUS@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.IsItem:IsItem@,         
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.IsKPI:IsKPI@, 
@SELECT:DIM_PROP:USER_DEF:IMPLIED:ITEM:X.hg_has_children:hg_has_children@,         
@SELECT:METRIC:USER_DEF:IMPLIED:X.TargetValue:Target@,         
@SELECT:METRIC:USER_DEF:IMPLIED:X.CurrentValue:Measurement@,         
@SELECT:METRIC:USER_DEF:IMPLIED:round(100*X.kpi_status,0):Variation@   
 FROM (
select distinct '1' @+@ SI.ID dim, SI.ID IntID, SI.CODE, SI.NAME, SI.DESCRIPTION, SP.ID PerspID, SP.NAME Perspective, SI.ITEM_LEVEL, 
RP.ID RelatedPlanIntl, RP.NAME RelatedPlan, RPPI.ID ParentItemRelPlanIntl, RPPI.NAME ParentItemRelPlan, SI.WEIGHT, 
SI.WEIGHTPERCENT, SI.ITEMSTATUS, null LAST_MEASURE_STATUS, SI.kpi_status, null CurrentValue, null TargetValue, 1 isItem, 0 isKPI,  
  CASE WHEN ((SELECT COUNT(*) FROM  ODF_CA_STRATEGIC_ITEM SI2  WHERE  SI2.PARENTITEM = SI.ID)+ 
             (SELECT COUNT(*) FROM  ODF_CA_STRATEGIC_ITEM SI3  WHERE  SI3.PARENTITEM_REL_PLAN = SI.ID)+
             (SELECT COUNT(*) FROM  ODF_MULTI_VALUED_LOOKUPS MVL2 
                              INNER join odf_ca_strat_kpi sk2					
                                on sk2.id = mvl2.value   AND   sk2.active = 1   AND   mvl2.attribute='related_kpis'   AND   mvl2.object='strategic_item'  
                              WHERE   mvl2.pk_id = SI.ID)) > 0 THEN '1' @+@ SI.ID ELSE NULL END hg_has_children  
 FROM  odf_ca_strategic_item SI
    LEFT OUTER JOIN ODF_CA_STRATEGIC_ITEM RP ON RP.ID = SI.RELATED_STRAT_PLAN 
    LEFT OUTER JOIN ODF_CA_STRATEGIC_ITEM RPPI ON RPPI.ID = SI.PARENTITEM_REL_PLAN
    LEFT OUTER JOIN ODF_CA_STRAT_BSC_PERSP SP ON SP.ID = SI.BSCPERSPECTIVE 
 WHERE   SI.ID = @WHERE:PARAM:USER_DEF:INTEGER:STRAT_HIER@  AND   SI.ACTIVE =1   AND   @NVL@(@WHERE:PARAM:USER_DEF:INTEGER:hg_row_id@,0) = 0  

UNION
Select distinct '1' @+@ SI.ID dim, SI.ID IntID, SI.CODE, SI.NAME, SI.DESCRIPTION,      SP.ID PerspID, SP.NAME Perspective, SI.ITEM_LEVEL, 
RP.ID RelatedPlanIntl, RP.NAME RelatedPlan, RPPI.ID ParentItemRelPlanIntl, RPPI.NAME ParentItemRelPlan, SI.WEIGHT, SI.WEIGHTPERCENT, 
SI.ITEMSTATUS, null LAST_MEASURE_STATUS, SI.kpi_status, null CurrentValue, null TargetValue,1 isItem, 0 isKPI,  
CASE WHEN ((SELECT COUNT(*) FROM  ODF_CA_STRATEGIC_ITEM SI2 WHERE SI2.PARENTITEM = SI.ID)+ 
           (SELECT COUNT(*) FROM  ODF_CA_STRATEGIC_ITEM SI3 WHERE SI3.PARENTITEM_REL_PLAN = SI.ID)+ 
           (SELECT COUNT(*) FROM  ODF_MULTI_VALUED_LOOKUPS MVL2 INNER   join odf_ca_strat_kpi sk2		on sk2.id = mvl2.value   AND   sk2.active = 1   AND   mvl2.attribute='related_kpis'   AND   mvl2.object='strategic_item'  
                            WHERE   mvl2.pk_id = SI.ID)) > 0 THEN '1' @+@ SI.ID ELSE NULL END hg_has_children  
 FROM  odf_ca_strategic_item SI    
    LEFT OUTER JOIN ODF_CA_STRATEGIC_ITEM RP ON RP.ID = SI.RELATED_STRAT_PLAN
    LEFT OUTER JOIN ODF_CA_STRATEGIC_ITEM RPPI ON RPPI.ID = SI.PARENTITEM_REL_PLAN
    LEFT OUTER JOIN ODF_CA_STRAT_BSC_PERSP SP ON SP.ID = SI.BSCPERSPECTIVE 
 WHERE   SI.PARENTITEM=substr(@WHERE:PARAM:USER_DEF:INTEGER:hg_row_id@,2)   AND   SI.ACTIVE =1   AND   substr(@WHERE:PARAM:USER_DEF:INTEGER:hg_row_id@,1,1)='1'  
UNION
Select distinct '3' @+@ SI.ID dim, SI.ID IntID, SI.CODE, SI.NAME, SI.DESCRIPTION,      SP.ID PerspID, SP.NAME Perspective, SI.ITEM_LEVEL, 
RP.ID RelatedPlanIntl, RP.NAME RelatedPlan, RPPI.ID ParentItemRelPlanIntl, RPPI.NAME ParentItemRelPlan, SI.WEIGHT, SI.WEIGHTPERCENT, 
SI.ITEMSTATUS, null LAST_MEASURE_STATUS, SI.kpi_status, null CurrentValue, null TargetValue,1 isItem, 0 isKPI,  
CASE WHEN ((SELECT COUNT(*) FROM  ODF_CA_STRATEGIC_ITEM SI2 WHERE SI2.PARENTITEM = SI.ID)+ 
           (SELECT COUNT(*) FROM  ODF_CA_STRATEGIC_ITEM SI3 WHERE SI3.PARENTITEM_REL_PLAN = SI.ID)+ 
           (SELECT COUNT(*) FROM  ODF_MULTI_VALUED_LOOKUPS MVL2 INNER   join odf_ca_strat_kpi sk2		on sk2.id = mvl2.value   AND   sk2.active = 1   AND   mvl2.attribute='related_kpis'   AND   mvl2.object='strategic_item'  
                            WHERE   mvl2.pk_id = SI.ID)) > 0 THEN '3' @+@ SI.ID ELSE NULL END hg_has_children  
 FROM  odf_ca_strategic_item SI    
    INNER JOIN ODF_CA_STRATEGIC_ITEM RP ON RP.ID = SI.STRAT_HIERARCHY and (@WHERE:PARAM:USER_DEF:INTEGER:RELPLAN@=1)
    INNER JOIN ODF_CA_STRATEGIC_ITEM RPPI ON RPPI.ID = SI.PARENTITEM
    LEFT OUTER JOIN ODF_CA_STRAT_BSC_PERSP SP ON SP.ID = SI.BSCPERSPECTIVE 
 WHERE   SI.PARENTITEM_REL_PLAN = substr(@WHERE:PARAM:USER_DEF:INTEGER:hg_row_id@,2) AND SI.ACTIVE =1   AND   substr(@WHERE:PARAM:USER_DEF:INTEGER:hg_row_id@,1,1)='1'  

UNION
Select '2' @+@ SK.ID dim, SK.ID IntID, SK.CODE, SK.NAME, SK.kpi_description DESCRIPTION,       Null PerspID, null Perspective, null Item_Level, 
null Weight, null WeightPercent, null RelatedPlanIntl, null RelatedPlan, null ParentItemRelPlanIntl, null ParentItemRelPlan, 
SK.STRAT_ITEM_STATUS ITEMSTATUS, SK.LAST_MEASURE_STATUS, SK.KPI_STATUS, SK.CURRENT_MEASUREMENT CurrentValue, SK.CURRENT_TARGET TargetValue, 0 isItem, 1 isKPI,  
   NULL hg_has_children
 FROM  odf_ca_strat_kpi sk    INNER   join odf_multi_valued_lookups mvl     on mvl.attribute='related_kpis'       AND   mvl.object='strategic_item'       AND   mvl.value=sk.id       AND   mvl.pk_id = substr(@WHERE:PARAM:USER_DEF:INTEGER:hg_row_id@,2)  
 WHERE   SK.ACTIVE = 1  AND   substr(@WHERE:PARAM:USER_DEF:INTEGER:hg_row_id@,1,1)='1'  

) X 
 WHERE   @FILTER@