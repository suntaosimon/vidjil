/* VIDJIL
 * License blablabla
 * date: 30/05/2013
 * version :0.0.01-a
 * 
 * visu.js
 * 
 * 
 * content:
 * 
 * initClones(data)
 * displayLegend(data)
 * updateLegend()
 * updateVis()
 * updateLook()
 * 
 * tick(e)
 * collide()
 * updateRadius()
 * 
 * vjSplit(posV, posJ)
 * sizeSplit() 
 * 
 */

var nodes = d3.range(totalClones).map(Object);	//container pour les circles 
var leg, lines;		//container pour les legendes / quadrillages
var w = 1400,		//largeur visu (avant resize)
    h = 700,		//hauteur visu (avant resize)
    padding = 5;	//espacement minimum entre les circles
    
var vis = d3.select("#visu").append("svg:svg")
    .attr("id", "svg");

//modele physique
var force = d3.layout.force()
    .gravity(0)
    .theta(0.8)
    .charge(-1)
    .friction(0.9)
    .nodes(nodes)
    .on("tick", tick)
    .size([w, h]);

//initialisation des nodes
var node = vis.selectAll("circle.node")
    .data(nodes)
    .enter().append("svg:circle")
    .attr("class", "node")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("stroke", "")
    .attr("stroke-width", 3) 
    .attr("r", 5)
    .call(force.drag)
    //.call(node_drag)
    .on("click", function(d,i) { 
      selectClone(i);
    })
    .on("mouseover", function(d,i){
      focusIn(i, 1);
    })
     .on("mouseout", function(d,i){
      focusOut(i);
    })
;
    
/* initialise les elements devant avec les données du modele
 * nodes[] pour la fenetre de visu
 * cree et rempli la liste html
 * TODO: initialiser favoris depuis prefs.json
 */
function initClones(data) {
  var divParent = document.getElementById("listClones");
  divParent.innerHTML="";

   for(var i=0 ;i<totalClones; i++){
     
      var n = [i]
      nodes[i].r1 = 5;
      nodes[i].r2 = 5;
      nodes[i].clones = n;
      nodes[i].focus = false;
      
      var div = document.createElement('div');
      div.id=i;
      div.className="listElem";
      div.onmouseover = function(){ focusIn(this.id, 0); }
      div.onmouseout= function(){ focusOut(this.id); }
      div.onclick=function(){ selectClone(this.id); }
      
      var span0 = document.createElement('span');
      span0.className = "nameBox";
      span0.appendChild(document.createTextNode(getname(i)));
      
      var span1 = document.createElement('span');
      span1.className = "colorBox";
      span1.id="color"+i;
      span1.onclick=function(){ changeColor(this.parentNode.id); }
      
      var span2=document.createElement('span')
      span2.className = "sizeBox";
      span2.appendChild(document.createTextNode((100*getSize(i)).toFixed(2)+"%"));
      
      div.appendChild(span0);
      div.appendChild(span1);
      div.appendChild(span2);
      div.style.background=color(i);
      document.getElementById("listClones").appendChild(div);
    }
}


/* attribue une data issue du modele aux legendes/quadrillages de la visualisation*/
function displayLegend(data){
  leg = vis.selectAll("text").data(data);
  leg.enter().append("text");
  leg.exit()
    .remove();
  leg
    .transition()
    .duration(1000)
    .attr("x", function(d) { 
      if (d.cx<5) { 
	if (d.class=="vjline1") return resizeCoef*(d.cx+60);
	  else return resizeCoef*(d.cx+150);
      }else return resizeCoef*d.cx;
    })
    .attr("y", function(d) { 
      if (d.cy<5) {
	if (d.class=="vjline1") return resizeCoef*(d.cy+20);
	else return resizeCoef*(d.cy+75);
      }else return resizeCoef*d.cy;
    })
    .text( function (d) { 
      if (d.class=="vjline2") return d.subname;
      else return d.name;
    })
    .attr("class", "vjLegend")
    .attr("fill", function (d) { return colorVJ[d.color]; });
    
  lines = vis.selectAll("line").data(data);
  lines.enter().append("line");
  lines.exit()    
    .remove();
  lines
    .transition()
    .duration(1000)
    .attr("x1", function(d) { return resizeCoef*d.cx; })
    .attr("x2", function(d) { 
      if (d.cx<5) return 5000;
      else return resizeCoef*d.cx;
    })
    .attr("y1", function(d) { return resizeCoef*d.cy; })
    .attr("y2", function(d) { 
      if (d.cy<5) return 5000;
      else return resizeCoef*d.cy;
    })
    .style("stroke", function (d) { return colorVJ[d.color]; })
    .attr("class", function (d) { return d.class; });
}

/*ne change pas les données associé a la légende 
 mais repositionne en cas de resize de la fenêtre */
function updateLegend(){
  leg
    .transition()
    .duration(1000)
    .attr("x", function(d) { 
      if (d.cx<5) { 
	if (d.class=="vjline1") return resizeCoef*(d.cx+60);
	  else return resizeCoef*(d.cx+150);
      }else return resizeCoef*d.cx;
    })
    .attr("y", function(d) { 
      if (d.cy<5) {
	if (d.class=="vjline1") return resizeCoef*(d.cy+20);
	else return resizeCoef*(d.cy+75);
      }else return resizeCoef*d.cy;
    })  
  lines
    .transition()
    .duration(1000)
    .attr("x1", function(d) { return resizeCoef*d.cx; })
    .attr("x2", function(d) { 
      if (d.cx==0) return 5000;
      else return resizeCoef*d.cx;
    })
    .attr("y1", function(d) { return resizeCoef*d.cy; })
    .attr("y2", function(d) { 
      if (d.cy==0) return 5000;
      else return resizeCoef*d.cy;
    });
}


/*mise a jour de la visualisation*/
function updateVis(){
  for(var i=0 ;i<totalClones; i++){
    nodes[i].r1=radius(i);
  }
  vis.selectAll("circle.node")
      .style("fill", function(i) { return color(i); })
  force.alpha(.2);
}


function updateLook(){
  node
  .transition()
  .duration(1500)
  .style("fill", function(i) { return color(i); } )
  node.style("stroke", function(i) { return stroke(i); } )
  for(var i=0 ;i<totalClones; i++){
    document.getElementById(i).style.background=color(i);
  }
}

  
/*ajoute la jonction b (ou le clone lead par la jonction b) dans le clone lead par a// TODO(gerer les cas speciaux)*/
function merge(a, b){
  var nlist = nodes[a].clones+nodes[b].clones;
  nodes[a].clones = nlist;
  nodes[b].clones=[];
}


/*libere la jonction b du clone lead par a TODO*/
function split(a, b){
  if (a==b) return
    
  for(var i=0 ;i<nodes[a].clones.length; i++){
    if (nodes[a].clones[i] == b) return
  }
}


/* update position frame by frame pour la gestion des collisions*/
function tick(e) {
    updateRadius()
    if (splitMethod=="vj1"){
      node.each(vjSplit(positionV, positionJ));
    }
    if (splitMethod=="vj2"){
      node.each(vjSplit(positionV2, positionJ2));
    }
    if (splitMethod==" "){
      node.each(sizeSplit());
    }
    node
      .each(collide())
      .attr("cx", function(d) { return (resizeCoef*d.x); })
      .attr("cy", function(d) { return (resizeCoef*d.y); })
      .attr("r" , function(d) { return (resizeCoef*d.r2); })
}


/*résolution des collisions*/
function collide() {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
   if (d.drag != 1){
    var r = nodes[d].r2+padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = nodes[d].r2 + nodes[quad.point].r2+padding;
        if (l < r) {
          l = (l - r) / l*0.5;
          d.x -= x *= l;
          d.y -= y *= l;
	  if(quad.point.drag!=1) {
	    quad.point.x += x;
	    quad.point.y += y;
	  }
        }
      }
      return x1 > nx2
          || x2 < nx1
          || y1 > ny2
          || y2 < ny1;
    });
   }
  };
}


/*mise a jour progressive des radius (evite les problemes physiques liés a des changements de taille brutaux)*/
function updateRadius(){
    for(var i=0 ;i<nodes.length; i++){
      if( nodes[i].r1 != nodes[i].r2){
	var delta = nodes[i].r1-nodes[i].r2;
	nodes[i].r2 +=0.03*delta;
      }
    }
}


/*méthode de répartition des clones en fonction des genes V et J*/
function vjSplit(posV, posJ){
    var coef = 0.005
    return function(d) {
      if (typeof junctions != "undefined") {
	if ( typeof(junctions[d].seg) != 'undefined' && typeof(junctions[d].seg.V) != 'undefined' ){
	  d.x+=coef*(posV[junctions[d].seg.V[0]]-d.x);
	  d.y+=coef*(posJ[junctions[d].seg.J[0]]-d.y);
	}else{
	  d.y+=coef*(50-d.y);
	  d.x+=coef*(50-d.x);
	}
      }
    };
}


/*méthode de répartition des clones en fonction du radius*/
function sizeSplit() {
  var coef = 0.006
    return function(d) {
      var r=getSize(d);
      if (d.drag != 1){
	if (r < 50){
	  d.x+=coef*(100-d.x);
	  d.y+=coef*(100-d.y);
	}else{
	  if (r < 200){
	      d.x+=coef*(550-d.x);
	      d.y+=coef*(250-d.y);
	  }else{
	      d.x+=coef*(950-d.x);
	      d.y+=coef*(400-d.y);
	  }
	}
      }
    };
}


