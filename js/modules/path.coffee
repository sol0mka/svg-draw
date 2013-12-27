define 'path', ['jquery', 'helpers', 'ProtoClass', 'line', 'underscore'], ($, helpers, ProtoClass, Line, _)->
	class Path extends ProtoClass
		type: 'path'

		initialize:(@o={})->
			@set 'id', helpers.genHash()


			if @o.coords
				@set 
					'startIJ': 	App.grid.toIJ @o.coords
					'endIJ': 		App.grid.toIJ @o.coords

			@on 'change:startIJ', _.bind @onChange, @
			@on 'change:endIJ', _.bind @onChange, @


		onChange:-> 
			@set 'oldIntersects', helpers.cloneObj @get 'intersects'
			@render()


		render:(isRepaintIntersects=false)->
			@removeFromGrid()
			@recalcPath()
			@makeSvgPath()
			App.grid.refreshGrid()

		pushPoint:(ij,i)->
			xy = App.grid.fromIJ ij
			node = App.grid.atIJ ij
			node.holders ?= {}

			node.holders[@get 'id'] = @

			point = { x: xy.x, y: xy.y, curve: null, i: i }
			@points.push(point)
			@points


		recalcPath:->
			helpers.timeIn 'path recalc'
			glimps = @makeGlimps()
			@points = []

			if glimps 
				startIJ = @get('startIJ')
				endIJ = @get('endIJ')
				dir = glimps.direction
				startBlock 	= glimps.startBlock
				endBlock 		= glimps.endBlock

				startW = Math.ceil(startBlock.get('w')/2)
				startH = Math.ceil(startBlock.get('h')/2)

				endW = Math.ceil(endBlock.get('w')/2)
				endH = Math.ceil(endBlock.get('h')/2)

				# normalize start/end points
				if dir is 'i'
					if startIJ.i < endIJ.i
						startIJ = {i: startIJ.i+startW,j: startIJ.j}
						endIJ 	= {i: endIJ.i-endW,j: endIJ.j}
					else 
						startIJ = {i: startIJ.i-startW,j: startIJ.j}
						endIJ 	= {i: endIJ.i+endW,j: endIJ.j}
				else 
					if startIJ.j < endIJ.j
						startIJ = {i: startIJ.i,j: startIJ.j+startH}
						endIJ 	= {i: endIJ.i,j: endIJ.j-endH}
					else 
						startIJ = {i: startIJ.i,j: startIJ.j-startH}
						endIJ 	= {i: endIJ.i,j: endIJ.j+endH}
						
					

				for i in [startIJ[dir]..Math.ceil(glimps.base)]
					if dir is 'i'
						ij = {i: i, j: startIJ.j}
					else
						ij = {i: startIJ.i, j: i}

					@pushPoint ij, i

				for i in [Math.ceil(glimps.base)..endIJ[dir]]
					if dir is 'i'
						ij = {i: i, j: endIJ.j}
					else 
						ij = {i: endIJ.i, j: i}
					@pushPoint ij, i

			else
				path = App.grid.getGapPolyfill 
									from: @get 'startIJ'
									to: 	@get 'endIJ'


				for point, i in path 
					ij = {i: point[0], j: point[1]}; xy = App.grid.fromIJ ij
					node = App.grid.atIJ ij
					node.holders ?= {}

					node.holders[@get 'id'] = @

					point = { x: xy.x, y: xy.y, curve: null, i: i }
					@points.push(point)
			
			@set 'points', @points
			@calcPolar()
			helpers.timeOut 'path recalc'
			@

		makeGlimps:->
			startIJ 	= @get 'startIJ'
			endIJ 		= @get 'endIJ'
			startBlock = @get('connectedStart')
			endBlock 	 = @get('connectedEnd')
			if not endBlock then return false
			if startIJ.i < endIJ.i
				end = (startIJ.i + startBlock.get('w')/2)
				xDifference =  (endIJ.i - endBlock.get('w')/2) - end
				xBase = end + (xDifference/2)
			else
				start = (endIJ.i + endBlock.get('w')/2)
				xDifference = (startIJ.i - startBlock.get('w')/2) - start
				xBase = start + (xDifference/2)

			if startIJ.j < endIJ.j
				end = (startIJ.j + startBlock.get('h')/2)
				yDifference =  (endIJ.j - endBlock.get('h')/2) - end
				yBase = end + (yDifference/2)
			else
				start = (endIJ.j + endBlock.get('h')/2)
				yDifference = (startIJ.j - startBlock.get('h')/2) - start
				yBase = start + (yDifference/2)

			baseDirection = if (xDifference >= yDifference) then 'i' else 'j'
			return returnValue =
								direction: baseDirection
								base: if baseDirection is 'i' then xBase else yBase
								startBlock: startBlock
								endBlock: 	endBlock

		calcPolar:->
			points = @get 'points'
			firstPoint  = points[0]
			lastPoint 	= points[points.length-1]
			@set 'xPolar', if firstPoint.x < lastPoint.x then 'plus' else 'minus'
			@set 'yPolar', if firstPoint.y < lastPoint.y then 'plus' else 'minus'

		repaintIntersects:(intersects)->
			for name, path of intersects
				continue if path.id is @id 
				path.render [path.id]
			@set 'oldIntersects', {}

		detectCollisions:()->
			@set 'intersects', {}
			for point in @get 'points'
				myDirection = @directionAt point
				node = App.grid.at point
				if _.size(node.holders) > 1
					_.chain(node.holders).where(type: 'path').each (holder)=>
						@set 'intersects', (@get('intersects')[holder.id] = holder)

					for name, path of @get 'intersects'
						continue if path.get 'id' is @get 'id'
						point.curve = "#{myDirection}" if myDirection isnt path.directionAt(point) and path.directionAt(point) isnt 'corner' and myDirection isnt 'corner'

		directionAt:(xy)->
			points = @get 'points'
			point = _.where(points, {x: xy.x, y: xy.y})[0]
			if !point then return 'corner'
			if points[point.i-1]?.x is point.x and points[point.i+1]?.x is point.x
				direction = 'vertical'
			else if points[point.i-1]?.y is point.y and points[point.i+1]?.y is point.y
				direction = 'horizontal'
			else direction = 'corner'
			direction


		makeSvgPath:()-> 
			if !@line? then @line = new Line path: @ else @line.resetPoints @get 'points'

		removeFromGrid:->
			points = @get 'points'
			return if !points?
			for point in points
				node = App.grid.at(point)
				delete node.holders[@get 'id']

		removeIfEmpty:-> 
			if @isEmpty()
				@line.remove()
				@removeFromGrid()
			App.grid.refreshGrid()

		isEmpty:-> 
			@line?.get('points').length <= 2

	Path